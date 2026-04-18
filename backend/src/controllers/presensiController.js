const prisma = require('../utils/db');
const logger = require('../utils/logger');
const Joi = require('joi');



const presensiSchema = Joi.array().items(
  Joi.object({
    siswa_id: Joi.string().uuid().required(),
    status: Joi.string().valid('Hadir', 'Izin', 'Sakit', 'Alpha').required(),
    keterangan: Joi.string().allow(null, '').optional(),
    tanggal: Joi.date().iso().required()
  })
).min(1).max(500);

const inputPresensiBulk = async (req, res, next) => {
  try {
    const { error, value: records } = presensiSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }

    const userId = req.user.userId;

    const operations = records.map(record => {
      // Mengubah string date ke native js Date
      const dateOnly = new Date(record.tanggal);
      return prisma.attendance.upsert({
        where: {
          student_id_attendance_date: {
            student_id: record.siswa_id,
            attendance_date: dateOnly
          }
        },
        update: {
          status: record.status,
          keterangan: record.keterangan || null,
          user_id: userId
        },
        create: {
          student_id: record.siswa_id,
          attendance_date: dateOnly,
          status: record.status,
          keterangan: record.keterangan || null,
          user_id: userId
        }
      });
    });

    await prisma.$transaction(operations);

    logger.audit(`Presensi masal di-upsert oleh ${req.user.username} (ID: ${userId}). Total data: ${records.length}`);

    return res.status(201).json({
      status: 'success',
      message: `${records.length} data presensi berhasil diproses`
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { inputPresensiBulk };
