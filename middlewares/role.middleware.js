const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        // SuperAdmin bypass: allow all access
        if (req.user.role === 'superAdmin') {
            return next();
        }

        // Check if user role is in the allowed list
        if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access denied: insufficient permissions" });
        }

        next();
    };
};

module.exports = authorize;
