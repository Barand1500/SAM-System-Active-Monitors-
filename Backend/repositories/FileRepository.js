const BaseRepository = require("./BaseRepository");
const { File, User } = require("../models");

class FileRepository extends BaseRepository {
  constructor() {
    super(File);
  }

  async findByCompany(company_id) {
    return this.model.findAll({
      where: { company_id },
      include: [{ model: User, as: "uploader", attributes: ["id", "first_name", "last_name", "email"] }],
      order: [["created_at", "DESC"]]
    });
  }

  async incrementDownloads(id) {
    const file = await this.model.findByPk(id);
    if (!file) throw new Error("File not found");
    file.downloads = (file.downloads || 0) + 1;
    await file.save();
    return file;
  }
}

module.exports = new FileRepository();