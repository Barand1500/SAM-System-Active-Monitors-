const BaseRepository = require("./BaseRepository");
const { File } = require("../models");

class FileRepository extends BaseRepository {
  constructor() {
    super(File);
  }

  async findByCompany(company_id) {
    return this.model.findAll({ where: { company_id } });
  }
}

module.exports = new FileRepository();