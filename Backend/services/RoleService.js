const roleRepo = require("../repositories/RoleRepository");
const { Role } = require("../models");

class RoleService {
  async list(companyId) {
    return roleRepo.findByCompany(companyId);
  }

  async create(companyId, data) {
    return roleRepo.create({
      companyId,
      roleKey: data.roleKey || data.id || data.label.toLowerCase().replace(/\s+/g, '_'),
      label: data.label,
      color: data.color || '#6366f1',
      permissions: data.permissions || [],
      sortOrder: data.sortOrder || 0,
    });
  }

  async update(id, companyId, data) {
    const role = await Role.findOne({ where: { id, company_id: companyId } });
    if (!role) throw new Error("Rol bulunamadı");
    if (data.label !== undefined) role.label = data.label;
    if (data.color !== undefined) role.color = data.color;
    if (data.permissions !== undefined) role.permissions = data.permissions;
    if (data.sortOrder !== undefined) role.sortOrder = data.sortOrder;
    await role.save();
    return role;
  }

  async delete(id, companyId) {
    const role = await Role.findOne({ where: { id, company_id: companyId } });
    if (!role) throw new Error("Rol bulunamadı");
    await role.destroy();
    return { message: "Rol silindi" };
  }

  async reorder(companyId, orderedIds) {
    for (let i = 0; i < orderedIds.length; i++) {
      await Role.update(
        { sort_order: i },
        { where: { id: orderedIds[i], company_id: companyId } }
      );
    }
    return { message: "Sıralama güncellendi" };
  }
}

module.exports = new RoleService();
