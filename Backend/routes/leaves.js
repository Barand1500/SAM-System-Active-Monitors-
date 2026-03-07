const express = require("express");
const router = express.Router();
const LeaveController = require("../controllers/LeaveController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

router.use(authenticate, companyIsolation);

// Employee endpoints
router.get("/", LeaveController.getMyLeaves);
router.post("/", LeaveController.createLeave);

// Manager/Boss approval endpoints
router.get("/pending", authorizeRoles("boss", "manager"), LeaveController.getPendingLeaves);
router.patch("/:id/approve", authorizeRoles("boss", "manager"), LeaveController.approveLeave);
router.patch("/:id/reject", authorizeRoles("boss", "manager"), LeaveController.rejectLeave);

module.exports = router;
