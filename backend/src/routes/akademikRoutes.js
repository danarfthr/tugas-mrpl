const express = require('express');
const router = express.Router();
const { inputNilaiBulk } = require('../controllers/akademikController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { apiWriteLimiter } = require('../middlewares/rateLimitMiddleware');

// Validasi Token untuk seluruh rute akademik
router.use(verifyToken);

// Hanya Guru Wali Kelas dan Admin Sekolah yang berhak input nilai
router.post('/nilai', requireRole(['Guru Wali Kelas', 'Admin Sekolah']), apiWriteLimiter, inputNilaiBulk);

module.exports = router;
