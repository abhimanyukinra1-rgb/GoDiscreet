const { query } = require('../config/database');
const { redisAsync } = require('../config/redis');
const logger = require('../utils/logger');

exports.getConversations = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    const conversations = await query(
      `SELECT c.id, c.is_unlocked,
              CASE WHEN c.user_a_id = $1 THEN c.user_b_id ELSE c.user_a_id END as user_id,
              u.anonymous_username, u.profile_picture_url,
              m.message_text as last_message,
              m.created_at as last_message_time,
              (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = false AND sender_id != $1) as unread_count
       FROM conversations c
       JOIN users u ON (CASE WHEN c.user_a_id = $1 THEN c.user_b_id ELSE c.user_a_id END = u.id)
       LEFT JOIN LATERAL (
         SELECT message_text, created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1
       ) m ON true
       WHERE (c.user_a_id = $1 OR c.user_b_id = $1) AND c.is_active = true
       ORDER BY m.created_at DESC NULLS LAST
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      success: true,
      data: { conversations: conversations.rows }
    });
  } catch (error) {
    logger.error('Get conversations error:', error);
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Verify user is part of conversation
    const convResult = await query(
      'SELECT id FROM conversations WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2)',
      [conversationId, userId]
    );

    if (convResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: { code: 'CHAT_001', message: 'Access denied' }
      });
    }

    const messages = await query(
      `SELECT id, sender_id, message_text, message_type, media_url, is_read, created_at
       FROM messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [conversationId, limit, offset]
    );

    // Mark as read
    await query(
      'UPDATE messages SET is_read = true, read_at = NOW() WHERE conversation_id = $1 AND sender_id != $2',
      [conversationId, userId]
    );

    res.json({
      success: true,
      data: { messages: messages.rows.reverse() }
    });
  } catch (error) {
    logger.error('Get messages error:', error);
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { message_text, message_type = 'TEXT' } = req.validatedBody;

    // Verify user can chat
    const convResult = await query(
      'SELECT is_unlocked FROM conversations WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2)',
      [conversationId, userId]
    );

    if (convResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: { code: 'CHAT_001', message: 'Conversation not unlocked' }
      });
    }

    if (!convResult.rows[0].is_unlocked) {
      return res.status(403).json({
        success: false,
        error: { code: 'CHAT_001', message: 'Conversation not unlocked' }
      });
    }

    // Insert message
    const msgResult = await query(
      `INSERT INTO messages (conversation_id, sender_id, message_text, message_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, created_at`,
      [conversationId, userId, message_text, message_type]
    );

    res.json({
      success: true,
      data: {
        id: msgResult.rows[0].id,
        created_at: msgResult.rows[0].created_at
      }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    next(error);
  }
};

exports.unlockChat = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { pearls_to_spend = 50 } = req.body;

    // Get user's pearl balance
    const balanceResult = await query(
      'SELECT SUM(CASE WHEN transaction_type IN ($1, $2) THEN amount ELSE -amount END) as balance FROM pearls WHERE user_id = $3',
      ['PURCHASE', 'BONUS', userId]
    );
    const balance = parseInt(balanceResult.rows[0]?.balance) || 0;

    if (balance < pearls_to_spend) {
      return res.status(400).json({
        success: false,
        error: { code: 'PEARL_001', message: 'Insufficient pearls' }
      });
    }

    // Deduct pearls
    await query(
      `INSERT INTO pearls (user_id, amount, transaction_type, description)
       VALUES ($1, $2, $3, $4)`,
      [userId, -pearls_to_spend, 'USE', 'Unlocked chat']
    );

    // Unlock conversation
    await query(
      'UPDATE conversations SET is_unlocked = true, unlock_type = $1, unlock_cost = $2 WHERE id = $3',
      ['PEARL', pearls_to_spend, conversationId]
    );

    res.json({
      success: true,
      data: {
        is_unlocked: true,
        remaining_pearls: balance - pearls_to_spend
      }
    });
  } catch (error) {
    logger.error('Unlock chat error:', error);
    next(error);
  }
};

exports.blockUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { block_reason = '' } = req.body;

    // Get other user
    const convResult = await query(
      'SELECT user_a_id, user_b_id FROM conversations WHERE id = $1',
      [conversationId]
    );
    const otherUserId = convResult.rows[0].user_a_id === userId 
      ? convResult.rows[0].user_b_id 
      : convResult.rows[0].user_a_id;

    // Insert block
    await query(
      'INSERT INTO blocked_users (blocker_id, blocked_id, block_reason) VALUES ($1, $2, $3)',
      [userId, otherUserId, block_reason]
    );

    res.json({
      success: true,
      data: { is_blocked: true }
    });
  } catch (error) {
    logger.error('Block user error:', error);
    next(error);
  }
};

exports.unblockUser = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    // Get other user
    const convResult = await query(
      'SELECT user_a_id, user_b_id FROM conversations WHERE id = $1',
      [conversationId]
    );
    const otherUserId = convResult.rows[0].user_a_id === userId 
      ? convResult.rows[0].user_b_id 
      : convResult.rows[0].user_a_id;

    // Delete block
    await query(
      'DELETE FROM blocked_users WHERE blocker_id = $1 AND blocked_id = $2',
      [userId, otherUserId]
    );

    res.json({
      success: true,
      data: { is_blocked: false }
    });
  } catch (error) {
    logger.error('Unblock user error:', error);
    next(error);
  }
};
