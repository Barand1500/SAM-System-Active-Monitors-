const fileRepo = require("../repositories/FileRepository");

class FileService {
  async create(data) {
    return fileRepo.create(data);
  }

  async getByCompany(company_id) {
    return fileRepo.findByCompany(company_id);
  }

  async getById(id) {
    return fileRepo.findById(id);
  }

  async delete(id) {
    return fileRepo.delete(id);
  }
}

module.exports = new FileService();
