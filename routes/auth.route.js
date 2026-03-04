const express = require("express");
const {
    signupUser,
    verifyUserOTP,
    loginUser,
    forgotUserPassword,
    getUsers
} = require("../controllers/auth.controller");
const router = express.Router();

router.post("/signup", signupUser);
router.post("/verify-otp", verifyUserOTP);
router.post("/login", loginUser);
router.post("/forgot-password", forgotUserPassword);
router.get("/users", getUsers);

module.exports = router;
