const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { apiReadLimiter } = require('./middlewares/rateLimitMiddleware');
const errorHandler = require('./middlewares/errorHandler');

// Route Imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const akademikRoutes = require('./routes/akademikRoutes');
const presensiRoutes = require('./routes/presensiRoutes');

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(cors());

// Parse JSON request body
app.use(express.json({ limit: '10kb' })); // Batasi ukuran body untuk hindari payload besar

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Terapkan rate limit read ke seluruh request api agar aman dari scrapers
app.use('/api/', apiReadLimiter);

// Routes
app.use('/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/akademik/nilai', akademikRoutes);
app.use('/api/v1/akademik/presensi', presensiRoutes);

// Menangkap rute yang tidak ditemukan (404)
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Halaman tidak ditemukan'
  });
});

// Custom error handling middleware
app.use(errorHandler);

module.exports = app;
