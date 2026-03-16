const express = require("express");
const {
    forgotUserPassword,
    getUsers,
    updateUserRole,
    deleteUser,
    signupUser,
    verifyUserOTP,
    loginUser,
    logoutUser
} = require("../controllers/auth.controller");
const authenticate = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");
const router = express.Router();

router.post("/signup", signupUser);
router.post("/verify-otp", verifyUserOTP);
router.post("/login", loginUser);
router.post("/logout", authenticate, logoutUser);
router.post("/forgot-password", forgotUserPassword);

// Admin routes
router.get("/users", authenticate, authorize(["superAdmin"]), getUsers);
router.patch("/users/:userId/role", authenticate, authorize(["superAdmin"]), updateUserRole);
router.delete("/users/:userId", authenticate, authorize(["superAdmin"]), deleteUser);

module.exports = router;
