const winston = require('winston');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'sma-api-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/app-info.log' }),
    new winston.transports.File({ filename: 'logs/audit.log', level: 'audit' })
  ],
});

// Custom audit level (RFC5424 severity)
winston.addColors({ audit: 'cyan' });

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Add a specific method for audit logs if needed
logger.audit = (message, meta) => {
  logger.log('info', `[AUDIT] ${message}`, meta);
};

module.exports = logger;
