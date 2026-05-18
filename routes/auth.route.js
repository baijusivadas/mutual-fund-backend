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
const validate = require("../middlewares/validation.middleware");
const { 
    signupSchema, 
    loginSchema, 
    verifyOTPSchema, 
    forgotPasswordSchema, 
    updateRoleSchema 
} = require("../validations/auth.validation");

const router = express.Router();

router.post("/signup", validate(signupSchema), signupUser);
router.post("/verify-otp", validate(verifyOTPSchema), verifyUserOTP);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", authenticate, logoutUser);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotUserPassword);

// Admin routes
router.get("/users", authenticate, authorize(["superAdmin"]), getUsers);
router.patch("/users/:userId/role", authenticate, authorize(["superAdmin"]), validate(updateRoleSchema), updateUserRole);
router.delete("/users/:userId", authenticate, authorize(["superAdmin"]), deleteUser);

module.exports = router;
