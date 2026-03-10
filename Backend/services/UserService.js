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

  async updateSkills(userId, companyId, skills) {
    // skills = ["React", "JavaScript", ...]
    const user = await UserRepo.getWithSkills(userId, companyId);
    if (!user) throw new Error("User not found");
    // Mevcut skill'leri sil
    await UserSkill.destroy({ where: { userId } });
    // Yenilerini ekle
    if (skills && skills.length > 0) {
      await UserSkill.bulkCreate(skills.map(name => ({ userId, name })));
    }
    return UserRepo.getWithSkills(userId, companyId);
  }
}

module.exports = new UserService();