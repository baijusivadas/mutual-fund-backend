const { auth_users, pending_users, active_sessions, User, user_roles } = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

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

    console.log(`[AUTH] OTP for ${email}: ${otp}`); // For demo purposes
    return { message: "OTP sent to email", email };
};

const verifyOTP = async (email, otp) => {
    const pendingUser = await pending_users.findOne({ where: { email } });
    if (!pendingUser) {
        throw new Error("No pending signup found for this email");
    }

    if (pendingUser.otp !== otp) {
        throw new Error("Invalid OTP");
    }

    if (new Date() > pendingUser.otp_expires_at) {
        throw new Error("OTP expired");
    }

    const newAuthUser = await auth_users.create({
        id: pendingUser.id,
        email: pendingUser.email,
        password_hash: pendingUser.password_hash,
        created_at: new Date()
    });

    await User.create({
        name: email.split('@')[0],
        folio: email.split('@')[0] + '-FOLIO', // Added missing folio
        auth_user_id: newAuthUser.id,
    });

    await pendingUser.destroy();

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

    const token = jwt.sign(
        { id: authUser.id, email: authUser.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '24h' }
    );

    await active_sessions.create({
        id: crypto.randomUUID(),
        auth_user_id: authUser.id,
        token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    const user = await User.findOne({ where: { auth_user_id: authUser.id } });
    const userRoleRecord = await user_roles.findOne({ where: { user_id: authUser.id } });
    const role = userRoleRecord ? userRoleRecord.role : 'user';

    return { user, token, role };
};

const forgotPassword = async (email) => {
    const user = await auth_users.findOne({ where: { email } });
    if (!user) {
        throw new Error("User not found");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000);

    // Reusing pending_users table for password reset OTPs or adding a new table?
    // Let's use it for simplicity for now, but usually it's a separate reset_tokens table.
    // Actually, let's just return a link in the response for simulation.
    const resetToken = crypto.randomBytes(32).toString('hex');

    console.log(`[AUTH] Reset OTP for ${email}: ${otp}`);
    console.log(`[AUTH] Reset Link: http://localhost:5173/reset-password?email=${email}&token=${resetToken}`);

    return { message: "Reset instructions sent", email, otp };
};

const getAllUsers = async () => {
    return await User.findAll({
        include: [{ model: auth_users, as: 'auth_user' }]
    });
};

module.exports = {
    signup,
    verifyOTP,
    login,
    forgotPassword,
    getAllUsers
};
