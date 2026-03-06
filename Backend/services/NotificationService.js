const notificationRepo = require("../repositories/NotificationRepository");

class NotificationService {
  async create(data) {
    return notificationRepo.create(data);
  }

  async getByUser(user_id) {
    return notificationRepo.findAll({ where: { user_id }, order: [["created_at", "DESC"]] });
  }

  async getUnreadByUser(user_id) {
    return notificationRepo.getUnreadByUser(user_id);
  }

  async markAsRead(id) {
    return notificationRepo.update(id, { is_read: true });
  }

  async markAllAsRead(user_id) {
    return notificationRepo.model.update(
      { is_read: true },
      { where: { user_id, is_read: false } }
    );
  }
}

module.exports = new NotificationService();
