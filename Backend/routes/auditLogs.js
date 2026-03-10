const express = require("express");
const router = express.Router();
const AuditLogController = require("../controllers/AuditLogController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", authenticate, authorizeRoles("boss", "manager"), AuditLogController.list);
router.post("/", authenticate, AuditLogController.create);
router.delete("/", authenticate, authorizeRoles("boss"), AuditLogController.clear);

module.exports = router;
