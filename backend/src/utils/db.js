const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create a pg pool using DATABASE_URL from env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Wrap the pool with Prisma adapter
const adapter = new PrismaPg(pool);

// Instantiate PrismaClient with the adapter (singleton)
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
