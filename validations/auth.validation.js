const { z } = require('zod');

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'superAdmin', 'user'], 'Invalid role'),
});

module.exports = {
  signupSchema,
  loginSchema,
  verifyOTPSchema,
  forgotPasswordSchema,
  updateRoleSchema,
};
