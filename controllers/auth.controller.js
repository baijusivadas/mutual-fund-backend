const { register, login, getAllUsers } = require("../services/auth.service");
const { createControllerLogger } = require("../middlewares/logger");
const logger = createControllerLogger("authController");

const registerUser = async (req, res) => {
    try {
        const result = await register(req.body);
        logger.info(`User registered: ${result.auth.email}`);
        res.status(201).json(result);
    } catch (err) {
        logger.error(`Registration error: ${err.message}`);
        res.status(400).json({ error: err.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await login(email, password);
        logger.info(`User logged in: ${email}`);
        res.json(result);
    } catch (err) {
        logger.error(`Login error: ${err.message}`);
        res.status(401).json({ error: err.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        logger.error(`Fetch users error: ${err.message}`);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUsers
};
