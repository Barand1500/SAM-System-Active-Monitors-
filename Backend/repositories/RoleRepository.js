const { Role } = require("../models");

class RoleRepository {
  async findByCompany(companyId) {
    return Role.findAll({
      where: { company_id: companyId },
      order: [["sort_order", "ASC"]],
    });
  }

  async create(data) {
    return Role.create(data);
  }

  async findOne(where) {
    return Role.findOne({ where });
  }
}

module.exports = new RoleRepository();
