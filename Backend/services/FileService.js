const fileRepo = require("../repositories/FileRepository");
const fs = require("fs");
const path = require("path");

class FileService {
  async create(data) {
    return fileRepo.create(data);
  }

  async getByCompany(company_id) {
    return fileRepo.findByCompany(company_id);
  }

  async getById(id, companyId = null) {
    return fileRepo.findById(id, companyId);
  }

  async download(id, companyId) {
    const file = await fileRepo.findById(id, companyId);
    if (!file) throw new Error("File not found");
    await fileRepo.incrementDownloads(id);
    return file;
  }

  async delete(id, companyId = null) {
    const file = await fileRepo.findById(id, companyId);
    if (!file) throw new Error("File not found");

    // Diskten dosyayı sil
    if (file.fileUrl) {
      const filePath = path.join(__dirname, "..", file.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    return fileRepo.delete(id, companyId);
  }
}

module.exports = new FileService();
