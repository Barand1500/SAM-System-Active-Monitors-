// Backend/repositories/AnnouncementRepository.js
const BaseRepository = require("./BaseRepository");
const { Announcement } = require("../models");

class AnnouncementRepository extends BaseRepository {
  constructor() {
    super(Announcement);
  }

  async getByCompany(company_id) {
    return this.model.findAll({ where: { company_id }, order: [['created_at','DESC']] });
  }
}

module.exports = new AnnouncementRepository();