const prisma = require('../utils/db');
const redisClient = require('../utils/redis');
const logger = require('../utils/logger');
const Joi = require('joi');



// Data Schema Validasi Input
const nilaiSchema = Joi.array().items(
  Joi.object({
    siswa_id: Joi.string().uuid().required(),
    mata_pelajaran_id: Joi.number().integer().positive().required(),
    nilai_akhir: Joi.number().min(0).max(100).required(),
    semester: Joi.string().required()
  })
).min(1).max(500); // Batasi maks 500 entry per request (untuk mitigasi DOS/Payload raksasa)

const inputNilaiBulk = async (req, res, next) => {
  try {
    const { error, value: records } = nilaiSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    // Pengecekan Idempotency Key
    const idempotencyKey = req.headers['x-idempotency-key'];
    if (idempotencyKey) {
      const hasKey = await redisClient.get(`idemp_${idempotencyKey}`);
      if (hasKey) {
        return res.status(409).json({ status: 'error', message: 'Tindakan sudah dieksekusi sebelumnya (Conflict)' });
      }
    }

    const userId = req.user.userId; // Dari verifyToken Middleware
    
    // Siapkan array promise untuk Prisma Transaction
    const operations = records.map(record => {
      return prisma.academicRecord.upsert({
        where: {
          student_id_subject_id_semester: {
            student_id: record.siswa_id,
            subject_id: record.mata_pelajaran_id,
            semester: record.semester
          }
        },
        update: {
          score: record.nilai_akhir,
          user_id: userId
        },
        create: {
          student_id: record.siswa_id,
          subject_id: record.mata_pelajaran_id,
          semester: record.semester,
          score: record.nilai_akhir,
          user_id: userId
        }
      });
    });

    // Menjalankan transaksi dalam database
    await prisma.$transaction(operations);

    // Simpan Idempotency Key jika ada
    if (idempotencyKey) {
      // Set dengan waktu kadaluarsa (misal 24 jam)
      await redisClient.setEx(`idemp_${idempotencyKey}`, 86400, 'done');
    }

    // Audit Traill
    logger.audit(`Nilai masal di-upsert oleh ${req.user.username} (ID: ${userId}). Total data: ${records.length}`);

    return res.status(201).json({
      status: 'success',
      message: `${records.length} data nilai berhasil diproses`
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { inputNilaiBulk };
