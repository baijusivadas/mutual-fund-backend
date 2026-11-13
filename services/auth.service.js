'use strict';

const {
  auth_users,
  pending_users,
  active_sessions,
  auth_activity_logs,
  User,
  user_roles,
  Organization,
  OrganizationMember,
  sequelize,
  Sequelize,
} = require('../models');
const { Op } = Sequelize;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_EXPIRES_IN, SESSION_DURATION_MS } = require('../config/constants');
const { ROLE_PERMISSIONS } = require('../config/permissions');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

const createAuthError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  error.statusCode = status;
  return error;
};

const emailDeliveryUnavailable = () => {
  const error = new Error('Email delivery is not configured');
  error.status = 503;
  error.statusCode = 503;
  return error;
};

// Fail fast if JWT secret is not configured
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Server cannot start.');
}

/**
 * Validate password strength
 * Must contain min 8 chars, at least one uppercase, one lowercase, one number
 */
const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) {
    throw createAuthError('Password must be at least 8 characters long', 400);
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber) {
    throw createAuthError(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      400
    );
  }
};

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

  // Find or use default organization
  let defaultOrg = await Organization.findOne({ where: { status: 'active' } });

  // Wrap in transaction to ensure atomicity
  await sequelize.transaction(async (t) => {
    const newAuthUser = await auth_users.create(
      {
        id: pendingUser.id,
        tenant_id: defaultOrg ? defaultOrg.id : null,
        email: pendingUser.email,
        password_hash: pendingUser.password_hash,
        login_attempts: 0,
        is_locked: false,
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

    if (defaultOrg && OrganizationMember) {
      await OrganizationMember.create(
        {
          id: crypto.randomUUID(),
          organization_id: defaultOrg.id,
          user_id: newAuthUser.id,
          role: 'client',
          status: 'active',
          joined_at: new Date(),
        },
        { transaction: t }
      );
    }

    await pendingUser.destroy({ transaction: t });
  });

  return { message: 'Account verified successfully' };
};

const login = async (email, password, context = {}) => {
  const normalizedEmail = email ? email.trim() : '';
  const authUser = await auth_users.findOne({
    where: { email: { [Op.iLike]: normalizedEmail } },
  });

  if (!authUser) {
    throw createAuthError('Invalid credentials', 401);
  }

  // ── Account Lockout Check ────────────────────────────────────────────────
  if (authUser.is_locked) {
    const lockTime = new Date(authUser.last_failed_login || authUser.created_at).getTime();
    const elapsed = Date.now() - lockTime;

    if (elapsed < LOCKOUT_DURATION_MS) {
      const remainingMinutes = Math.ceil((LOCKOUT_DURATION_MS - elapsed) / 60000);
      throw createAuthError(
        `Account temporarily locked due to consecutive failed attempts. Try again in ${remainingMinutes} minute(s).`,
        423
      );
    } else {
      // Auto-unlock after lockout period has passed
      await authUser.update({ is_locked: false, login_attempts: 0 });
    }
  }

  const isMatch = await bcrypt.compare(password, authUser.password_hash);
  if (!isMatch) {
    const newAttempts = (authUser.login_attempts || 0) + 1;
    const shouldLock = newAttempts >= MAX_FAILED_ATTEMPTS;

    await authUser.update({
      login_attempts: newAttempts,
      is_locked: shouldLock,
      last_failed_login: new Date(),
    });

    if (auth_activity_logs) {
      await auth_activity_logs.create({
        id: crypto.randomUUID(),
        user_id: authUser.id,
        event_type: 'FAILED_LOGIN',
        ip_address: context.ip || null,
        user_agent: context.userAgent || null,
        created_at: new Date(),
      }).catch(() => {});
    }

    if (shouldLock) {
      throw createAuthError(
        'Account locked due to 5 consecutive failed login attempts. Please wait 15 minutes before trying again.',
        423
      );
    }

    throw createAuthError('Invalid credentials', 401);
  }

  // Successful login — reset failed attempts and record login
  await authUser.update({
    login_attempts: 0,
    is_locked: false,
    last_login_at: new Date(),
  });

  // Resolve user role
  const userRoleRecord = await user_roles.findOne({ where: { user_id: authUser.id } });
  const role = userRoleRecord ? userRoleRecord.role : 'user';

  // Resolve active tenant / organization
  let tenantId = authUser.tenant_id;
  if (!tenantId && OrganizationMember) {
    const member = await OrganizationMember.findOne({
      where: { user_id: authUser.id, status: 'active' },
    });
    if (member) tenantId = member.organization_id;
  }
  if (!tenantId) {
    const defaultOrg = await Organization.findOne({ where: { status: 'active' } });
    if (defaultOrg) tenantId = defaultOrg.id;
  }

  const permissions = ROLE_PERMISSIONS[role] || [];

  const token = jwt.sign(
    {
      id: authUser.id,
      email: authUser.email,
      role,
      tenantId: tenantId || null,
      permissions,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN || '24h',
    }
  );

  await active_sessions.create({
    id: crypto.randomUUID(),
    auth_user_id: authUser.id,
    token,
    expires_at: new Date(Date.now() + (SESSION_DURATION_MS || 24 * 60 * 60 * 1000)),
  });

  if (auth_activity_logs) {
    await auth_activity_logs.create({
      id: crypto.randomUUID(),
      user_id: authUser.id,
      event_type: 'LOGIN_SUCCESS',
      ip_address: context.ip || null,
      user_agent: context.userAgent || null,
      created_at: new Date(),
    }).catch(() => {});
  }

  const user = await User.findOne({ where: { auth_user_id: authUser.id } });

  return {
    user,
    token,
    role,
    tenantId: tenantId || null,
    permissions,
  };
};

const forgotPassword = async () => {
  throw emailDeliveryUnavailable();
};

const getAllUsersWithRoles = async (tenantId = null) => {
  const users = await User.findAll();
  const roles = await user_roles.findAll();

  const authUserWhere = tenantId ? { tenant_id: tenantId } : {};
  const authUsers = await auth_users.findAll({ where: authUserWhere });
  const allowedAuthIds = new Set(authUsers.map((au) => au.id));

  const filteredUsers = tenantId
    ? users.filter((u) => allowedAuthIds.has(u.auth_user_id))
    : users;

  return filteredUsers.map((user) => {
    const authUser = authUsers.find((au) => au.id === user.auth_user_id);
    const userRole = roles.find((r) => r.user_id === user.auth_user_id);
    return {
      id: user.auth_user_id,
      email: authUser ? authUser.email : 'N/A',
      full_name: user.name,
      role: userRole ? userRole.role : 'user',
      tenant_id: authUser ? authUser.tenant_id : null,
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
  await sequelize.transaction(async (t) => {
    if (OrganizationMember) {
      await OrganizationMember.destroy({ where: { user_id: userId }, transaction: t });
    }
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
  validatePasswordStrength,
};
