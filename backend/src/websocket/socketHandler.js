const logger = require('../utils/logger');
const { redisAsync } = require('../config/redis');
const jwt = require('jwt-simple');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Authenticate user
    socket.on('auth', (token) => {
      try {
        const decoded = jwt.decode(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        socket.join(`user_${decoded.userId}`);
        logger.info(`User authenticated: ${decoded.userId}`);
      } catch (error) {
        logger.error('Socket auth error:', error);
        socket.disconnect();
      }
    });

    // Message events
    socket.on('message:send', (data) => {
      io.to(`user_${data.receiverId}`).emit('message:received', {
        senderId: socket.userId,
        ...data
      });
      logger.info(`Message sent from ${socket.userId} to ${data.receiverId}`);
    });

    // Typing indicators
    socket.on('typing:start', (data) => {
      io.to(`user_${data.receiverId}`).emit('user:typing', {
        userId: socket.userId
      });
    });

    socket.on('typing:stop', (data) => {
      io.to(`user_${data.receiverId}`).emit('user:stopped-typing', {
        userId: socket.userId
      });
    });

    // Call events
    socket.on('call:initiate', (data) => {
      io.to(`user_${data.receiverId}`).emit('call:incoming', {
        callerId: socket.userId,
        callId: data.callId,
        rtcToken: data.rtcToken
      });
    });

    socket.on('call:answer', (data) => {
      io.to(`user_${data.callerId}`).emit('call:answered', {
        rtcToken: data.rtcToken
      });
    });

    socket.on('call:reject', (data) => {
      io.to(`user_${data.callerId}`).emit('call:rejected', {
        reason: data.reason
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });
};

module.exports = socketHandler;
