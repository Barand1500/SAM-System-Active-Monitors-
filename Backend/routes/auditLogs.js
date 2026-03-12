const express = require("express");
const router = express.Router();
const AuditLogController = require("../controllers/AuditLogController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// Tüm kullanıcılar aktiviteleri görebilir
router.get("/", authenticate, AuditLogController.list);
router.post("/", authenticate, AuditLogController.create);
// Sadece boss temizleyebilir
router.delete("/", authenticate, authorizeRoles("boss"), AuditLogController.clear);

module.exports = router;
