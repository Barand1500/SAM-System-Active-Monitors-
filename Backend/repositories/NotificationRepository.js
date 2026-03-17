// Backend/repositories/NotificationRepository.js
const BaseRepository = require("./BaseRepository");
const { Notification } = require("../models");

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async getUnreadByUser(userId) {
    return this.model.findAll({ where: { userId, isRead: false }, order: [['created_at','DESC']] });
  }
}

module.exports = new NotificationRepository();