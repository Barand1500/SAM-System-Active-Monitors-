// Backend/controllers/NotificationController.js
const NotificationService = require("../services/NotificationService");

class NotificationController {
  async list(req, res) {
    try {
      const notifications = await NotificationService.getByUser(req.user.id);
      res.json(notifications);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async markRead(req, res) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id);
      res.json(notification);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async markAllRead(req, res) {
    try {
      await NotificationService.markAllAsRead(req.user.id);
      res.json({ message: "All notifications marked as read" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new NotificationController();