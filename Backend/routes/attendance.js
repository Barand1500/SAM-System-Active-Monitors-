// Backend/routes/attendance.js
const express = require("express");
const router = express.Router();
const AttendanceController = require("../controllers/AttendanceController");
const BreakController = require("../controllers/BreakController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// Attendance
router.post("/check-in", authenticate, AttendanceController.checkIn);
router.post("/check-out", authenticate, AttendanceController.checkOut);

// Attendance list (manager/boss)
router.get("/", authenticate, authorizeRoles("boss", "manager"), AttendanceController.list);

// User's own weekly logs
router.get("/my-weekly", authenticate, AttendanceController.myWeekly);

// Breaks
router.post("/breaks/start", authenticate, BreakController.startBreak);
router.post("/breaks/end/:breakId", authenticate, BreakController.endBreak);

module.exports = router;