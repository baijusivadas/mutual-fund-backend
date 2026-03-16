const authService = require("../services/auth.service");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("authController");

const signupUser = async (req, res, next) => {
    try {
        const result = await authService.signup(req.body);
        logger.info(`User signup initiated: ${req.body.email}`);
        res.status(201).json(result);
    } catch (err) {
        logger.error(`Signup error: ${err.message}`);
        next(err);
    }
};

const verifyUserOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const result = await authService.verifyOTP(email, otp);
        logger.info(`User OTP verified: ${email}`);
        res.json(result);
    } catch (err) {
        logger.error(`OTP verification error: ${err.message}`);
        next(err);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        logger.info(`User logged in: ${email}`);
        res.json(result);
    } catch (err) {
        logger.error(`Login error: ${err.message}`);
        next(err);
    }
};

const forgotUserPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const result = await authService.forgotPassword(email);
        res.json(result);
    } catch (err) {
        logger.error(`Forgot password error: ${err.message}`);
        next(err);
    }
};

const getUsers = async (req, res, next) => {
    try {
        const users = await authService.getAllUsersWithRoles();
        res.json(users);
    } catch (err) {
        logger.error(`Get users error: ${err.message}`);
        next(err);
    }
};

const updateUserRole = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        const result = await authService.updateUserRole(userId, role);
        logger.info(`User role updated: ${userId} to ${role}`);
        res.json(result);
    } catch (err) {
        logger.error(`Update user role error: ${err.message}`);
        next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const result = await authService.deleteUser(userId);
        logger.info(`User deleted: ${userId}`);
        res.json(result);
    } catch (err) {
        logger.error(`Delete user error: ${err.message}`);
        next(err);
    }
};

const logoutUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(400).json({ error: "No token provided" });
        const result = await authService.logout(token);
        logger.info(`User logged out: ${req.user?.email}`);
        res.json(result);
    } catch (err) {
        logger.error(`Logout error: ${err.message}`);
        next(err);
    }
};

module.exports = {
    signupUser,
    verifyUserOTP,
    loginUser,
    logoutUser,
    forgotUserPassword,
    getUsers,
    updateUserRole,
    deleteUser
};
