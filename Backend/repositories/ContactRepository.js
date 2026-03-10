const BaseRepository = require("./BaseRepository");

class ContactRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  async findByCompany(companyId) {
    return this.model.findAll({
      where: { company_id: companyId },
      order: [["name", "ASC"]],
    });
  }
}

module.exports = ContactRepository;
