// Backend/services/UserService.js
const bcrypt = require("bcrypt");
const UserRepo = require("../repositories/UserRepository");
const UserSkill = require("../models").UserSkill;

class UserService {
  async createUser(data) {
    data.password = await bcrypt.hash(data.password, 10);
    return UserRepo.create(data);
  }

  async updateUser(id, data) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return UserRepo.update(id, data);
  }

  async getUserWithSkills(user_id) {
    return UserRepo.getWithSkills(user_id);
  }

  async listByCompany(company_id) {
    return UserRepo.getByCompany(company_id);
  }
}

module.exports = new UserService();