// Backend/repositories/NotificationRepository.js
const BaseRepository = require("./BaseRepository");
const { Notification } = require("../models");

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async getUnreadByUser(user_id) {
    return this.model.findAll({ where: { user_id, is_read: false }, order: [['created_at','DESC']] });
  }
}

module.exports = new NotificationRepository();