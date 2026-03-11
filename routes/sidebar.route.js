const express = require("express");
const { getSidebarItems } = require("../controllers/sidebar.controller");
const authenticate = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/sidebar", authenticate, getSidebarItems);

module.exports = router;
