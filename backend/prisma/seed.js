require('dotenv').config({ path: `.env.development` });
const prisma = require('../src/utils/db'); // singleton with adapter
const bcrypt = require('bcrypt');

async function main() {
  console.log('Seeding database...');

  // Create roles
  const superAdminRole = await prisma.role.upsert({
    where: { role_name: 'Super Admin' },
    update: {},
    create: { role_name: 'Super Admin' },
  });

  const adminRole = await prisma.role.upsert({
    where: { role_name: 'Admin Sekolah' },
    update: {},
    create: { role_name: 'Admin Sekolah' },
  });

  const guruRole = await prisma.role.upsert({
    where: { role_name: 'Guru Wali Kelas' },
    update: {},
    create: { role_name: 'Guru Wali Kelas' },
  });

  // Create hashed password
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create users
  await prisma.user.upsert({
    where: { username: 'guru_budi' },
    update: {},
    create: {
      username: 'guru_budi',
      password_hash: passwordHash,
      full_name: 'Budi (Guru Wali Kelas)',
      role_id: guruRole.id,
    },
  });

  await prisma.user.upsert({
    where: { username: 'admin_sekolah' },
    update: {},
    create: {
      username: 'admin_sekolah',
      password_hash: passwordHash,
      full_name: 'Admin Sekolah Utama',
      role_id: adminRole.id,
    },
  });

  // Create class and subject
  const class1 = await prisma.class.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, class_name: 'X-MIPA 1', grade_level: 'X' },
  });

  await prisma.subject.upsert({
    where: { subject_code: 'MAT-X' },
    update: {},
    create: { subject_code: 'MAT-X', subject_name: 'Matematika' },
  });

  // Create students if not exist
  const studentCount = await prisma.student.count();
  if (studentCount === 0) {
    await prisma.student.createMany({
      data: [
        { id: 'db4b0ebd-0c53-470b-8dce-0ab07eef331f', class_id: class1.id, nisn: '10001', full_name: 'Agus Santoso' },
        { id: 'fdfe0ebd-0c53-470b-8dce-0ab07eef332a', class_id: class1.id, nisn: '10002', full_name: 'Budi Rahayu' },
      ],
    });
  }

  console.log('Seeding selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
