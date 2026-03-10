const { Tag } = require("../models");
const BaseRepository = require("./BaseRepository");

class TagRepository extends BaseRepository {
  constructor() {
    super(Tag);
  }

  async findByCompany(companyId) {
    return this.model.findAll({
      where: { company_id: companyId },
      order: [["name", "ASC"]],
    });
  }
}

module.exports = new TagRepository();
