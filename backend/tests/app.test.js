const request = require('supertest');
const fs = require('fs');
const path = require('path');

// Kita memerlukan instance app express (disarankan dipisahkan app / server.js)
const app = require('../src/app');

// Kita akan mock client redis supaya tidak terhubung ke redis secara real saat test
jest.mock('../src/utils/redis', () => ({
  get: jest.fn(),
  setEx: jest.fn(),
  connect: jest.fn(),
  on: jest.fn()
}));

// Mock Prisma
jest.mock('../src/utils/db', () => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  user: { findUnique: jest.fn() },
  $transaction: jest.fn()
}));

describe('Health Check Framework & Otorisasi', () => {
  it('GET /health harus mengembalikan 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('success');
  });

  it('Akses endpoint terproteksi tanpa token ditolak (401)', async () => {
    const res = await request(app).post('/api/v1/akademik/nilai');
    expect(res.statusCode).toEqual(401);
  });
});
