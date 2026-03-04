const { signup, verifyOTP, login, forgotPassword, getAllUsers } = require("../services/auth.service");
const { createControllerLogger } = require("../utils/logger");
const logger = createControllerLogger("authController");

const signupUser = async (req, res) => {
    const result = await signup(req.body);
    logger.info(`User signup initiated: ${req.body.email}`);
    res.status(201).json(result);
};

const verifyUserOTP = async (req, res) => {
    const { email, otp } = req.body;
    const result = await verifyOTP(email, otp);
    logger.info(`User OTP verified: ${email}`);
    res.json(result);
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const result = await login(email, password);
    logger.info(`User logged in: ${email}`);
    res.json(result);
};

const forgotUserPassword = async (req, res) => {
    const { email } = req.body;
    const result = await forgotPassword(email);
    res.json(result);
};

const getUsers = async (req, res) => {
    const users = await getAllUsers();
    res.json(users);
};

module.exports = {
    signupUser,
    verifyUserOTP,
    loginUser,
    forgotUserPassword,
    getUsers
};
