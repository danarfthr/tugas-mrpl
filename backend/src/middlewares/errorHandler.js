const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Hanya log err message beserta stack bila di non-production
  if (process.env.NODE_ENV !== 'production') {
    logger.error(`Error pada ${req.method} ${req.originalUrl}: ${err.message}`, { stack: err.stack });
  } else {
    // Pada production, stack di sembunyikan (OWASP Information Disclosure)
    logger.error(`Error pada ${req.method} ${req.originalUrl}: ${err.message}`);
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production' 
    ? 'Telah terjadi kesalahan pada server internal' 
    : err.message;

  res.status(statusCode).json({
    status: 'error',
    message: message,
  });
};

module.exports = errorHandler;
