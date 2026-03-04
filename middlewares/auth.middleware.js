const jwt = require("jsonwebtoken");
const { user_roles } = require("../models");

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');

        // Fetch the user's role
        const userRoleRecord = await user_roles.findOne({ where: { user_id: decoded.id } });
        const role = userRoleRecord ? userRoleRecord.role : 'user';

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: role
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = authenticate;
