// Backend/routes/attendance.js
const express = require("express");
const router = express.Router();
const AttendanceController = require("../controllers/AttendanceController");
const BreakController = require("../controllers/BreakController");
const LeaveController = require("../controllers/LeaveController");
const { authenticate } = require("../middleware/authMiddleware");

// Attendance
router.post("/check-in", authenticate, AttendanceController.checkIn);
router.post("/check-out", authenticate, AttendanceController.checkOut);

// Breaks
router.post("/breaks/start", authenticate, BreakController.startBreak);
router.post("/breaks/end/:breakId", authenticate, BreakController.endBreak);

// Leave Requests
router.post("/leaves", authenticate, LeaveController.createLeave);
router.get("/leaves", authenticate, LeaveController.getMyLeaves);

module.exports = router;