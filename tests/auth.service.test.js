require('dotenv').config();
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-at-least-32-chars-long-abcdef';

const assert = require('node:assert/strict');
const test = require('node:test');
const authService = require('../services/auth.service');

test('signup reports unavailable when email delivery is not configured', async () => {
  await assert.rejects(
    authService.signup({ email: 'demo@example.test', password: 'password123' }),
    { message: 'Email delivery is not configured', status: 503 }
  );
});

test('password reset reports unavailable without exposing account information', async () => {
  await assert.rejects(authService.forgotPassword('demo@example.test'), {
    message: 'Email delivery is not configured',
    status: 503,
  });
});
