require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIO = require('socket.io');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const matchesRoutes = require('./routes/matches');
const chatRoutes = require('./routes/chat');
const pearlsRoutes = require('./routes/pearls');
const boostRoutes = require('./routes/boost');
const settingsRoutes = require('./routes/settings');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/matches', matchesRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/pearls', pearlsRoutes);
app.use('/api/v1/boost', boostRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/admin', adminRoutes);

// WebSocket Handler
require('./websocket/socketHandler')(io);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Resource not found'
    }
  });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`🚀 GoDiscreet Backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, server, io };
