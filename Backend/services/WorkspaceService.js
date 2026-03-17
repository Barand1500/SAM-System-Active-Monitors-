const workspaceRepo = require("../repositories/WorkspaceRepository");
const { WorkspaceMember } = require("../models");

class WorkspaceService {
  async create(data) {
    const workspace = await workspaceRepo.create(data);
    // Oluşturanı admin olarak ekle
    await WorkspaceMember.create({
      workspace_id: workspace.id,
      user_id: data.created_by,
      role: "admin",
      joined_at: new Date()
    });
    return workspace;
  }

  async getByCompany(company_id) {
    return workspaceRepo.findByCompany(company_id);
  }

  async getById(id, companyId) {
    return workspaceRepo.findWithMembers(id, companyId);
  }

  async update(id, data, companyId) {
    return workspaceRepo.update(id, data, companyId);
  }

  async delete(id, companyId) {
    return workspaceRepo.delete(id, companyId);
  }

  async addMember(workspace_id, user_id, role = "member") {
    return WorkspaceMember.create({ workspace_id, user_id, role, joined_at: new Date() });
  }

  async removeMember(workspace_id, user_id) {
    const member = await WorkspaceMember.findOne({ where: { workspace_id, user_id } });
    if (!member) throw new Error("Üye bulunamadı");
    return member.destroy();
  }
}

module.exports = new WorkspaceService();
