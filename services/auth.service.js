const {
  auth_users,
  pending_users,
  active_sessions,
  User,
  user_roles,
  sequelize,
  Sequelize,
} = require('../models');
const { Op } = Sequelize;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const createAuthError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const emailDeliveryUnavailable = () => {
  const error = new Error('Email delivery is not configured');
  error.status = 503;
  return error;
};

// Fail fast if JWT secret is not configured
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Server cannot start.');
}

const signup = async () => {
  throw emailDeliveryUnavailable();
};

const verifyOTP = async (email, otp) => {
  const pendingUser = await pending_users.findOne({
    where: { email: { [Op.iLike]: email.trim() } },
  });
  if (!pendingUser) {
    throw createAuthError('No pending signup found for this email', 404);
  }

  // Timing-safe OTP comparison to prevent timing attacks
  const otpBuffer = Buffer.from(otp.padEnd(6));
  const storedBuffer = Buffer.from(String(pendingUser.otp).padEnd(6));
  const isOtpValid =
    otpBuffer.length === storedBuffer.length && crypto.timingSafeEqual(otpBuffer, storedBuffer);
  if (!isOtpValid) {
    throw createAuthError('Invalid OTP', 400);
  }

  if (new Date() > pendingUser.otp_expires_at) {
    throw createAuthError('OTP expired', 400);
  }

  // Wrap in transaction to ensure atomicity
  await sequelize.transaction(async (t) => {
    const newAuthUser = await auth_users.create(
      {
        id: pendingUser.id,
        email: pendingUser.email,
        password_hash: pendingUser.password_hash,
        created_at: new Date(),
      },
      { transaction: t }
    );

    await User.create(
      {
        name: email.split('@')[0],
        folio: email.split('@')[0] + '-FOLIO',
        auth_user_id: newAuthUser.id,
      },
      { transaction: t }
    );

    await pendingUser.destroy({ transaction: t });
  });

  return { message: 'Account verified successfully' };
};

const login = async (email, password) => {
  const authUser = await auth_users.findOne({
    where: { email: { [Op.iLike]: email.trim() } },
  });
  if (!authUser) {
    throw createAuthError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, authUser.password_hash);
  if (!isMatch) {
    throw createAuthError('Invalid credentials', 401);
  }

  // Fetch role before signing so it's embedded in the token
  // (avoids a DB query on every authenticated request)
  const userRoleRecord = await user_roles.findOne({ where: { user_id: authUser.id } });
  const role = userRoleRecord ? userRoleRecord.role : 'user';

  const token = jwt.sign({ id: authUser.id, email: authUser.email, role }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });

  await active_sessions.create({
    id: crypto.randomUUID(),
    auth_user_id: authUser.id,
    token,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const user = await User.findOne({ where: { auth_user_id: authUser.id } });

  return { user, token, role };
};

const forgotPassword = async () => {
  throw emailDeliveryUnavailable();
};

const getAllUsersWithRoles = async () => {
  const users = await User.findAll();
  const roles = await user_roles.findAll();
  const authUsers = await auth_users.findAll();

  return users.map((user) => {
    const authUser = authUsers.find((au) => au.id === user.auth_user_id);
    const userRole = roles.find((r) => r.user_id === user.auth_user_id);
    return {
      id: user.auth_user_id,
      email: authUser ? authUser.email : 'N/A',
      full_name: user.name,
      role: userRole ? userRole.role : 'user',
      created_at: user.created_at,
    };
  });
};

const updateUserRole = async (userId, newRole) => {
  return await sequelize.transaction(async (t) => {
    const userRoleRecord = await user_roles.findOne({
      where: { user_id: userId },
      transaction: t,
    });
    const result = userRoleRecord
      ? await userRoleRecord.update({ role: newRole }, { transaction: t })
      : await user_roles.create(
          {
            id: crypto.randomUUID(),
            user_id: userId,
            role: newRole,
            created_at: new Date(),
          },
          { transaction: t }
        );

    await active_sessions.destroy({
      where: { auth_user_id: userId },
      transaction: t,
    });
    return result;
  });
};

const deleteUser = async (userId) => {
  // Wrapped in a transaction for atomicity — partial deletes won't leave orphaned records
  await sequelize.transaction(async (t) => {
    await user_roles.destroy({ where: { user_id: userId }, transaction: t });
    await active_sessions.destroy({ where: { auth_user_id: userId }, transaction: t });
    await User.destroy({ where: { auth_user_id: userId }, transaction: t });
    await auth_users.destroy({ where: { id: userId }, transaction: t });
  });
  return { message: 'User and all associated data deleted successfully' };
};

const logout = async (token) => {
  const destroyed = await active_sessions.destroy({ where: { token } });
  if (!destroyed) {
    throw createAuthError('Session not found or already expired', 404);
  }
  return { message: 'Logged out successfully' };
};

const updateUserProfile = async (userId, { full_name }) => {
  const user = await User.findOne({ where: { auth_user_id: userId } });
  if (!user) {
    throw createAuthError('User not found', 404);
  }
  await user.update({ name: full_name });
  return { message: 'Profile updated successfully' };
};

module.exports = {
  signup,
  verifyOTP,
  login,
  logout,
  forgotPassword,
  getAllUsersWithRoles,
  updateUserRole,
  updateUserProfile,
  deleteUser,
};
