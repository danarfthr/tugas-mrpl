const express = require('express');
const router = express.Router();
const { inputPresensiBulk } = require('../controllers/presensiController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { apiWriteLimiter } = require('../middlewares/rateLimitMiddleware');

router.use(verifyToken);

// Hanya Guru Wali Kelas dan Admin Sekolah yang berhak input presensi
router.post('/', requireRole(['Guru Wali Kelas', 'Admin Sekolah']), apiWriteLimiter, inputPresensiBulk);

module.exports = router;
