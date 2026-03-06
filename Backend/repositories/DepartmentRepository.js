const BaseRepository = require("./BaseRepository");
const { Department } = require("../models");

class DepartmentRepository extends BaseRepository {
  constructor() {
    super(Department);
  }

  async findByCompany(company_id) {
    return this.model.findAll({ where: { company_id } });
  }
}

module.exports = new DepartmentRepository();
