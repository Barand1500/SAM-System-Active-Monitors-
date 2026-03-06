// Backend/routes/notifications.js
const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/NotificationController");
const AnnouncementController = require("../controllers/AnnouncementController");
const CompanySettingController = require("../controllers/CompanySettingController");
const { authenticate } = require("../middleware/authMiddleware");

// Notifications
router.get("/", authenticate, NotificationController.list);
router.patch("/read/:id", authenticate, NotificationController.markRead);

// Announcements
router.get("/announcements", authenticate, AnnouncementController.list);
router.post("/announcements", authenticate, AnnouncementController.create);
router.put("/announcements/:id", authenticate, AnnouncementController.update);
router.delete("/announcements/:id", authenticate, AnnouncementController.delete);

// Company Settings
router.get("/company-settings", authenticate, CompanySettingController.get);
router.put("/company-settings", authenticate, CompanySettingController.update);

module.exports = router;