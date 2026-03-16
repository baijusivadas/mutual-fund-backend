const { auth_users, pending_users, active_sessions, User, user_roles, sequelize } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { logger } = require("../utils/logger");

// Fail fast if JWT secret is not configured
if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET environment variable is not set. Server cannot start.");
}

const signup = async (userData) => {
    const { email, password } = userData;

    const existingUser = await auth_users.findOne({ where: { email } });
    if (existingUser) {
        throw new Error("Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 10) * 60000);

    const pendingUser = await pending_users.findOne({ where: { email } });
    if (pendingUser) {
        await pendingUser.update({
            password_hash: hashedPassword,
            otp,
            otp_expires_at: otpExpires
        });
    } else {
        await pending_users.create({
            id: crypto.randomUUID(),
            email,
            password_hash: hashedPassword,
            otp,
            otp_expires_at: otpExpires
        });
    }

    logger.info(`[AUTH] OTP for ${email}: ${otp}`);
    return { message: "OTP sent to email", email };
};

const verifyOTP = async (email, otp) => {
    const pendingUser = await pending_users.findOne({ where: { email } });
    if (!pendingUser) {
        throw new Error("No pending signup found for this email");
    }

    // Timing-safe OTP comparison to prevent timing attacks
    const otpBuffer = Buffer.from(otp.padEnd(6));
    const storedBuffer = Buffer.from(String(pendingUser.otp).padEnd(6));
    const isOtpValid = otpBuffer.length === storedBuffer.length &&
        crypto.timingSafeEqual(otpBuffer, storedBuffer);
    if (!isOtpValid) {
        throw new Error("Invalid OTP");
    }

    if (new Date() > pendingUser.otp_expires_at) {
        throw new Error("OTP expired");
    }

    // Wrap in transaction to ensure atomicity
    await sequelize.transaction(async (t) => {
        const newAuthUser = await auth_users.create({
            id: pendingUser.id,
            email: pendingUser.email,
            password_hash: pendingUser.password_hash,
            created_at: new Date()
        }, { transaction: t });

        await User.create({
            name: email.split('@')[0],
            folio: email.split('@')[0] + '-FOLIO',
            auth_user_id: newAuthUser.id,
        }, { transaction: t });

        await pendingUser.destroy({ transaction: t });
    });

    return { message: "Account verified successfully" };
};

const login = async (email, password) => {
    const authUser = await auth_users.findOne({ where: { email } });
    if (!authUser) {
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, authUser.password_hash);
    if (!isMatch) {
        throw new Error("Invalid credentials");
    }

    // Fetch role before signing so it's embedded in the token
    // (avoids a DB query on every authenticated request)
    const userRoleRecord = await user_roles.findOne({ where: { user_id: authUser.id } });
    const role = userRoleRecord ? userRoleRecord.role : 'user';

    const token = jwt.sign(
        { id: authUser.id, email: authUser.email, role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );

    await active_sessions.create({
        id: crypto.randomUUID(),
        auth_user_id: authUser.id,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const user = await User.findOne({ where: { auth_user_id: authUser.id } });

    return { user, token, role };
};

const forgotPassword = async (email) => {
    const user = await auth_users.findOne({ where: { email } });
    if (!user) {
        throw new Error("User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = crypto.randomBytes(32).toString('hex');

    // TODO: Send otp and resetToken via email (Nodemailer). Do NOT return them in the response.
    logger.info(`[AUTH] Reset OTP for ${email}: ${otp}`);
    logger.info(`[AUTH] Reset Link: http://localhost:5173/reset-password?email=${email}&token=${resetToken}`);

    // SECURITY: otp and resetToken are intentionally NOT returned in the response
    return { message: "Reset instructions sent to your email address" };
};

const getAllUsersWithRoles = async () => {
    const users = await User.findAll();
    const roles = await user_roles.findAll();
    const authUsers = await auth_users.findAll();

    return users.map(user => {
        const authUser = authUsers.find(au => au.id === user.auth_user_id);
        const userRole = roles.find(r => r.user_id === user.auth_user_id);
        return {
            id: user.auth_user_id,
            email: authUser ? authUser.email : 'N/A',
            full_name: user.name,
            role: userRole ? userRole.role : 'user',
            created_at: user.created_at
        };
    });
};

const updateUserRole = async (userId, newRole) => {
    const userRoleRecord = await user_roles.findOne({ where: { user_id: userId } });
    if (userRoleRecord) {
        return await userRoleRecord.update({ role: newRole });
    } else {
        return await user_roles.create({
            id: crypto.randomUUID(),
            user_id: userId,
            role: newRole,
            created_at: new Date()
        });
    }
};

const deleteUser = async (userId) => {
    // Wrapped in a transaction for atomicity — partial deletes won't leave orphaned records
    await sequelize.transaction(async (t) => {
        await user_roles.destroy({ where: { user_id: userId }, transaction: t });
        await active_sessions.destroy({ where: { auth_user_id: userId }, transaction: t });
        await User.destroy({ where: { auth_user_id: userId }, transaction: t });
        await auth_users.destroy({ where: { id: userId }, transaction: t });
    });
    return { message: "User and all associated data deleted successfully" };
};

const logout = async (token) => {
    const destroyed = await active_sessions.destroy({ where: { token } });
    if (!destroyed) {
        throw new Error("Session not found or already expired");
    }
    return { message: "Logged out successfully" };
};

module.exports = {
    signup,
    verifyOTP,
    login,
    logout,
    forgotPassword,
    getAllUsersWithRoles,
    updateUserRole,
    deleteUser
};
