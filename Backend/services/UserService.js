// Backend/services/UserService.js
const bcrypt = require("bcrypt");
const UserRepo = require("../repositories/UserRepository");
const UserSkill = require("../models").UserSkill;

// Geçerli ENUM değerleri
const VALID_ROLE_ENUMS = ["boss", "manager", "employee", "customer"];

// roles dizisinden ENUM'a uygun değer çıkar
function resolveRoleEnum(roles) {
  if (!Array.isArray(roles) || roles.length === 0) return "employee";
  // Önce ENUM'a uyan bir değer bul (boss > manager > employee > customer)
  for (const priority of VALID_ROLE_ENUMS) {
    if (roles.includes(priority)) return priority;
  }
  // Hiçbiri uymuyorsa (özel rol), varsayılan olarak employee kullan
  return "employee";
}

class UserService {
  async createUser(data) {
    const skills = data.skills;
    delete data.skills;
    if (!data.password) {
      throw new Error("Şifre alanı zorunludur");
    }
    data.password = await bcrypt.hash(data.password, 10);
    // roles array'den role ENUM'u güvenli senkronize et
    if (Array.isArray(data.roles) && data.roles.length > 0) {
      data.roles = [...new Set(data.roles)];
      data.role = resolveRoleEnum(data.roles);
    }
    const user = await UserRepo.create(data);
    if (skills && skills.length > 0) {
      await UserSkill.bulkCreate(skills.map(s => ({
        userId: user.id,
        name: typeof s === 'string' ? s : s.name,
        category: typeof s === 'string' ? null : (s.category || null),
        level: typeof s === 'string' ? 'intermediate' : (s.level || 'intermediate')
      })));
    }
    return UserRepo.getWithSkills(user.id, user.companyId || user.company_id);
  }

  async updateUser(id, data, companyId) {
    const skills = data.skills;
    delete data.skills;
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    // roles array'den role ENUM'u güvenli senkronize et
    if (Array.isArray(data.roles) && data.roles.length > 0) {
      data.roles = [...new Set(data.roles)];
      data.role = resolveRoleEnum(data.roles);
    }
    const user = await UserRepo.update(id, data, companyId);
    if (skills !== undefined) {
      await UserSkill.destroy({ where: { userId: id } });
      if (skills && skills.length > 0) {
        await UserSkill.bulkCreate(skills.map(s => ({
          userId: id,
          name: typeof s === 'string' ? s : s.name,
          category: typeof s === 'string' ? null : (s.category || null),
          level: typeof s === 'string' ? 'intermediate' : (s.level || 'intermediate')
        })));
      }
    }
    return UserRepo.getWithSkills(id, companyId);
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
    if (!user) throw new Error("Kullanıcı bulunamadı");
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