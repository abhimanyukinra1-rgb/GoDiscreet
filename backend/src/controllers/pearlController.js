const { query } = require('../config/database');
const logger = require('../utils/logger');

const pearlPackages = {
  BASIC: { pearls: 100, price: 99, currency: 'INR' },
  STANDARD: { pearls: 500, price: 399, currency: 'INR' },
  PREMIUM: { pearls: 1000, price: 699, currency: 'INR' },
  ELITE: { pearls: 5000, price: 2999, currency: 'INR' }
};

exports.getBalance = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const result = await query(
      `SELECT SUM(CASE WHEN transaction_type IN ('PURCHASE', 'BONUS') THEN amount ELSE -amount END) as balance
       FROM pearls WHERE user_id = $1`,
      [userId]
    );
    const balance = parseInt(result.rows[0]?.balance) || 0;

    res.json({
      success: true,
      data: {
        current_balance: balance,
        pending_balance: 0
      }
    });
  } catch (error) {
    logger.error('Get balance error:', error);
    next(error);
  }
};

exports.purchasePearls = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { package: pkgName, payment_method } = req.validatedBody;

    if (!pearlPackages[pkgName]) {
      return res.status(400).json({
        success: false,
        error: { code: 'PEARL_001', message: 'Invalid package' }
      });
    }

    const pkg = pearlPackages[pkgName];
    const orderId = `ORDER_${Date.now()}`;

    // TODO: Integrate with Razorpay
    // For now, simulate successful order
    const paymentResult = await query(
      `INSERT INTO payments (user_id, amount, currency, payment_method, pearl_amount, razorpay_order_id, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [userId, pkg.price, pkg.currency, payment_method, pkg.pearls, orderId, 'PENDING']
    );

    res.json({
      success: true,
      data: {
        order_id: orderId,
        amount: pkg.price,
        currency: pkg.currency,
        pearls: pkg.pearls,
        payment_link: `https://api.razorpay.com/v1/checkout?order_id=${orderId}`
      }
    });
  } catch (error) {
    logger.error('Purchase pearls error:', error);
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { limit = 20, offset = 0 } = req.query;

    const transactions = await query(
      `SELECT id, amount, transaction_type, description, created_at
       FROM pearls
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      success: true,
      data: { transactions: transactions.rows }
    });
  } catch (error) {
    logger.error('Get transactions error:', error);
    next(error);
  }
};

exports.usePearls = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { amount, reason } = req.body;

    await query(
      'INSERT INTO pearls (user_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4)',
      [userId, -amount, 'USE', reason]
    );

    res.json({
      success: true,
      data: { message: 'Pearls used successfully' }
    });
  } catch (error) {
    logger.error('Use pearls error:', error);
    next(error);
  }
};
