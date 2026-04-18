require('dotenv').config({ path: `.env.development` });
const prisma = require('../src/utils/db');
(async () => {
  const users = await prisma.user.findMany({ include: { role: true } });
  console.log('Users in DB:', users.map(u => ({username: u.username, role: u.role.role_name})));
  await prisma.$disconnect();
})();
