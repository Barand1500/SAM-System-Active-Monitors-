// Backend/repositories/UserRepository.js
const BaseRepository = require("./BaseRepository");
const { User, UserSkill, Department } = require("../models");

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ where: { email } });
  }

  async getByCompany(company_id) {
    return this.model.findAll({ where: { company_id }, include: [{ model: Department }] });
  }

  async getWithSkills(userId, companyId) {
    const where = { id: userId };
    if (companyId) where.company_id = companyId;
    return this.model.findOne({ where, include: [{ model: UserSkill }, { model: Department }] });
  }
}

module.exports = new UserRepository();