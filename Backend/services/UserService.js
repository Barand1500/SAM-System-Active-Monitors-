// Backend/services/UserService.js
const bcrypt = require("bcrypt");
const UserRepo = require("../repositories/UserRepository");
const UserSkill = require("../models").UserSkill;

class UserService {
  async createUser(data) {
    data.password = await bcrypt.hash(data.password, 10);
    return UserRepo.create(data);
  }

  async updateUser(id, data, companyId) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return UserRepo.update(id, data, companyId);
  }

  async getUserWithSkills(userId, companyId) {
    return UserRepo.getWithSkills(userId, companyId);
  }

  async listByCompany(company_id) {
    return UserRepo.getByCompany(company_id);
  }

  async deleteUser(id, companyId) {
    return UserRepo.delete(id, companyId);
  }
}

module.exports = new UserService();