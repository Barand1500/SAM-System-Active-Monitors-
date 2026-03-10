const express = require("express");
const router = express.Router();
const ReportController = require("../controllers/ReportController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/tasks", authenticate, authorizeRoles("boss", "manager"), ReportController.taskReport);
router.get("/attendance", authenticate, authorizeRoles("boss", "manager"), ReportController.attendanceReport);
router.get("/leaves", authenticate, authorizeRoles("boss", "manager"), ReportController.leaveReport);
router.get("/weekly-trend", authenticate, authorizeRoles("boss", "manager"), ReportController.weeklyTrend);
router.get("/task-trends", authenticate, authorizeRoles("boss", "manager"), ReportController.taskTrends);

module.exports = router;
