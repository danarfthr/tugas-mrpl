const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const handlerFunc = (req, res, next, options) => {
  logger.warn(`Rate limit exceeded for IP ${req.ip} on route ${req.originalUrl}`);
  res.status(options.statusCode).json({
    status: 'error',
    message: options.message,
  });
};

// Rate limiter untuk endpoint /auth/login (Max 5 req/min)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 5,
  message: 'Terlalu banyak percobaan login dari IP ini. Silakan coba lagi setelah 1 menit.',
  handler: handlerFunc,
});

// Rate limiter untuk endpoint general read (Max 100 req/min)
const apiReadLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100,
  message: 'Batas permintaan API terlampaui. Silakan coba lagi nanti.',
  handler: handlerFunc,
});

// Rate limiter khusus untuk proses tulis/bulk (Max 30 req/min)
const apiWriteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 30,
  message: 'Terlalu banyak permintaan pembaruan secara masif (bulk/write). Harap kurangi frekuensi permintaan.',
  handler: handlerFunc,
});

module.exports = {
  authLimiter,
  apiReadLimiter,
  apiWriteLimiter
};
