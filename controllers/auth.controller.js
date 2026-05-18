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
  const result = await authService.login(email, password);
  logger.info(`User logged in: ${email}`);
  sendSuccess(res, result, 'Logged in successfully');
};

const forgotUserPassword = async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword(email);
  sendSuccess(res, result, 'Password reset instructions sent');
};

const getUsers = async (req, res) => {
  const users = await authService.getAllUsersWithRoles();
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
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(400).json({ status: 'error', message: 'No token provided' });
  }
  const result = await authService.logout(token);
  logger.info(`User logged out: ${req.user?.email}`);
  sendSuccess(res, result, 'Logged out successfully');
};

module.exports = {
  signupUser,
  verifyUserOTP,
  loginUser,
  logoutUser,
  forgotUserPassword,
  getUsers,
  updateUserRole,
  deleteUser,
};

