// Backend/controllers/NotificationController.js
const NotificationRepo = require("../repositories/NotificationRepository");

class NotificationController {
  async list(req, res) {
    try {
      const notifications = await NotificationRepo.model.findAll({
        where: { user_id: req.user.id },
        order: [['created_at','DESC']],
      });
      res.json(notifications);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async markRead(req, res) {
    try {
      const notification = await NotificationRepo.model.findByPk(req.params.id);
      if (!notification) return res.status(404).json({ error: "Notification not found" });
      notification.is_read = true;
      await notification.save();
      res.json(notification);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new NotificationController();