'use strict';

const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/responseHelper');
const { createControllerLogger } = require('../utils/logger');
const logger = createControllerLogger('authController');

const signupUser = async (req, res) => {
  const result = await authService.signup(req.body);
  logger.info(`User signup initiated: ${req.body.email}`);
  sendSuccess(res, result, 'Signup successful. Check your email for the OTP.', 201);
};

const verifyUserOTP = async (req, res) => {
  const { email, otp } = req.body;
  const result = await authService.verifyOTP(email, otp);
  logger.info(`User OTP verified: ${email}`);
  sendSuccess(res, result, 'OTP verified successfully');
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const context = {
    ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
  };
  const result = await authService.login(email, password, context);
  logger.info(`User logged in: ${email}`);

  // Set secure HttpOnly session cookie
  if (result.token) {
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  sendSuccess(res, result, 'Logged in successfully');
};

const forgotUserPassword = async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  sendSuccess(res, result, 'Password reset instructions sent');
};

const getUsers = async (req, res) => {
  const tenantId = req.user.role === 'superAdmin' ? req.query.tenantId || null : req.user.tenantId;
  const users = await authService.getAllUsersWithRoles(tenantId);
  sendSuccess(res, users);
};

const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  const result = await authService.updateUserRole(userId, role);
  logger.info(`User role updated: ${userId} to ${role}`);
  sendSuccess(res, result, 'User role updated successfully');
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const result = await authService.deleteUser(userId);
  logger.info(`User deleted: ${userId}`);
  sendSuccess(res, result, 'User deleted successfully');
};

const logoutUser = async (req, res) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token && req.headers.cookie) {
    const cookies = Object.fromEntries(
      req.headers.cookie.split(';').map((c) => c.trim().split('='))
    );
    token = cookies.token || cookies.auth_token;
  }

  res.clearCookie('token', { path: '/' });

  if (token) {
    await authService.logout(token).catch(() => {});
  }
  logger.info(`User logged out: ${req.user?.email || 'session'}`);
  sendSuccess(res, { loggedOut: true }, 'Logged out successfully');
};

const updateUserProfile = async (req, res) => {
  const result = await authService.updateUserProfile(req.user.id, req.body);
  logger.info(`User profile updated: ${req.user.id}`);
  sendSuccess(res, result, 'Profile updated successfully');
};

module.exports = {
  signupUser,
  verifyUserOTP,
  loginUser,
  forgotUserPassword,
  getUsers,
  updateUserRole,
  deleteUser,
  logoutUser,
  updateUserProfile,
};
