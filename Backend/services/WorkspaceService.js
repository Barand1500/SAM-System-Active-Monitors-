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

  async getById(id) {
    return workspaceRepo.findWithMembers(id);
  }

  async update(id, data) {
    return workspaceRepo.update(id, data);
  }

  async delete(id) {
    return workspaceRepo.delete(id);
  }

  async addMember(workspace_id, user_id, role = "member") {
    return WorkspaceMember.create({ workspace_id, user_id, role, joined_at: new Date() });
  }

  async removeMember(workspace_id, user_id) {
    const member = await WorkspaceMember.findOne({ where: { workspace_id, user_id } });
    if (!member) throw new Error("Member not found");
    return member.destroy();
  }
}

module.exports = new WorkspaceService();
