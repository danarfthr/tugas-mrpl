const jwt = require('jsonwebtoken');
const redisClient = require('../utils/redis');
const logger = require('../utils/logger');

// Middleware untuk memverifikasi token JWT
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    logger.warn('Akses ditolak: Tidak ada token disediakan');
    return res.status(401).json({ status: 'error', message: 'Token otorisasi diperlukan' });
  }

  const token = authHeader.split(' ')[1]; // Format: Bearer <token>
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Format token tidak valid' });
  }

  try {
    // Check Blacklist
    const isBlacklisted = await redisClient.get(`blacklist_${token}`);
    if (isBlacklisted) {
      return res.status(401).json({ status: 'error', message: 'Token telah dicabut (Revoked)' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Berisi username, userId, roleId, roleName
    next();
  } catch (err) {
    logger.error(`Akses ditolak: Token tidak valid - ${err.message}`);
    return res.status(403).json({ status: 'error', message: 'Token otorisasi tidak valid atau telah kadaluwarsa' });
  }
};

// Middleware untuk RBAC (Role-Based Access Control)
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleName) {
      return res.status(403).json({ status: 'error', message: 'Akses ditolak: Informasi role tidak ditemukan' });
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      logger.warn(`Akses ditolak (RBAC): User ${req.user.username} (Role: ${req.user.roleName}) mencoba mengakses rute terlarang.`);
      return res.status(403).json({ status: 'error', message: 'Akses ditolak: Anda tidak memiliki hak akses' });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
