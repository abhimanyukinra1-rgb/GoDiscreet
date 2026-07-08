const redis = require('redis');
const logger = require('../utils/logger');

const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retry_strategy: (times) => Math.min(times * 50, 2000)
});

client.on('error', (err) => {
  logger.error('Redis Client Error:', err);
});

client.on('connect', () => {
  logger.info('Redis Client Connected');
});

const redisAsync = {
  get: (key) => new Promise((resolve, reject) => {
    client.get(key, (err, data) => {
      if (err) reject(err);
      resolve(data ? JSON.parse(data) : null);
    });
  }),
  set: (key, value, ttl = 3600) => new Promise((resolve, reject) => {
    client.setex(key, ttl, JSON.stringify(value), (err) => {
      if (err) reject(err);
      resolve(true);
    });
  }),
  del: (key) => new Promise((resolve, reject) => {
    client.del(key, (err) => {
      if (err) reject(err);
      resolve(true);
    });
  }),
  exists: (key) => new Promise((resolve, reject) => {
    client.exists(key, (err, exists) => {
      if (err) reject(err);
      resolve(exists === 1);
    });
  })
};

module.exports = { client, redisAsync };
