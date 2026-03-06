const announcementRepo = require("../repositories/AnnouncementRepository");

class AnnouncementService {
  async create(data) {
    return announcementRepo.create(data);
  }

  async getByCompany(company_id) {
    return announcementRepo.getByCompany(company_id);
  }

  async getById(id) {
    return announcementRepo.findById(id);
  }

  async update(id, data) {
    return announcementRepo.update(id, data);
  }

  async delete(id) {
    return announcementRepo.delete(id);
  }
}

module.exports = new AnnouncementService();
