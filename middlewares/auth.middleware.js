const jwt = require("jsonwebtoken");
const { active_sessions } = require("../models");

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    try {
        // Role is embedded in the token — no per-request DB call needed
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Validate token is still active (not logged out)
        const session = await active_sessions.findOne({ where: { token } });
        if (!session) {
            return res.status(401).json({ error: "Session expired or logged out. Please log in again." });
        }

        // Check session expiry
        if (new Date() > new Date(session.expires_at)) {
            await session.destroy();
            return res.status(401).json({ error: "Session expired. Please log in again." });
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role || 'user'
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};

module.exports = authenticate;
