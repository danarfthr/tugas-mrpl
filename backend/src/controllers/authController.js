const bcrypt = require('bcrypt');
const redisClient = require('../utils/redis');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/db');
const logger = require('../utils/logger');
const Joi = require('joi');



// Validasi Input
const loginSchema = Joi.object({
  username: Joi.string().pattern(/^[a-zA-Z0-9_]+$/).min(3).max(50).required(),
  password: Joi.string().required() // Tidak perlu limit regex jika password dpt berisi char spesial untuk login
});

const login = async (req, res, next) => {
  try {
    // Validasi Sanitasi
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    const { username, password } = value;

    // Cari User di DB (beserta rolenya) // Prepared statement otomatis oleh Prisma
    const user = await prisma.user.findUnique({
      where: { username },
      include: { role: true }
    });

    if (!user) {
      logger.warn(`Gagal login: Username ${username} tidak ditemukan.`);
      return res.status(401).json({ status: 'error', message: 'Kredensial tidak valid' });
    }

    // Komparasi Password menggunakan Bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      logger.warn(`Gagal login: Password salah untuk username ${username}.`);
      return res.status(401).json({ status: 'error', message: 'Kredensial tidak valid' });
    }

    // Generate JWT
    const payload = {
      userId: user.id,
      username: user.username,
      roleId: user.role.id,
      roleName: user.role.role_name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    logger.info(`User berhasil login: ${username}`);
    
    res.status(200).json({
      status: 'success',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role.role_name
        }
      }
    });

  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ status: 'error', message: 'Token tidak disediakan' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ status: 'error', message: 'Format token salah' });

    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const now = Math.floor(Date.now() / 1000);
      const ttl = decoded.exp - now;
      if (ttl > 0) {
        await redisClient.setEx(`blacklist_${token}`, ttl, 'revoked');
      }
    }
    
    res.status(200).json({ status: 'success', message: 'Berhasil logout' });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, logout };
