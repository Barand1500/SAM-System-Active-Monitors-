const express = require("express");
const router = express.Router();
const DashboardController = require("../controllers/DashboardController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/summary", authenticate, DashboardController.getSummary);

module.exports = router;
