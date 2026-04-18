const { createClient } = require('redis');
const logger = require('./logger');

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis connected successfully'));

// Initiate connection
(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
