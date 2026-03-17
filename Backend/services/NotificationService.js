const notificationRepo = require("../repositories/NotificationRepository");

class NotificationService {
  async create(data) {
    return notificationRepo.create(data);
  }

  async getByUser(userId) {
    return notificationRepo.findAll({ where: { userId }, order: [["created_at", "DESC"]] });
  }

  async getUnreadByUser(userId) {
    return notificationRepo.getUnreadByUser(userId);
  }

  async markAsRead(id) {
    return notificationRepo.update(id, { isRead: true });
  }

  async markAllAsRead(userId) {
    return notificationRepo.model.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
  }
}

module.exports = new NotificationService();
