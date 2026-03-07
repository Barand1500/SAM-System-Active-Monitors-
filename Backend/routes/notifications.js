// Backend/routes/notifications.js
const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController");
const { authenticate } = require("../middleware/authMiddleware");

// Notifications
router.get("/", authenticate, NotificationController.list);
router.patch("/read/:id", authenticate, NotificationController.markRead);
router.patch("/read-all", authenticate, NotificationController.markAllRead);

module.exports = router;