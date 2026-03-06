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

  async getWithSkills(user_id) {
    return this.model.findByPk(user_id, { include: [{ model: UserSkill }] });
  }
}

module.exports = new UserRepository();