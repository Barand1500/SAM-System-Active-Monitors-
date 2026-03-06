const express = require("express");
const router = express.Router();
const LeaveController = require("../controllers/LeaveController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/", authenticate, LeaveController.getMyLeaves);
router.post("/", authenticate, LeaveController.createLeave);

module.exports = router;
