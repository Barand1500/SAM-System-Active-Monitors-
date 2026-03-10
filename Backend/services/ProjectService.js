const projectRepo = require("../repositories/ProjectRepository");
const { ProjectMember, Workspace } = require("../models");

class ProjectService {
  async create(data) {
    // workspaceId yoksa company'nin ilk workspace'ini kullan
    if (!data.workspaceId && data.companyId) {
      const ws = await Workspace.findOne({ where: { company_id: data.companyId } });
      if (!ws) throw new Error("No workspace found for this company");
      data.workspaceId = ws.id;
    }
    const project = await projectRepo.create(data);
    // Oluşturanı lead olarak ekle
    await ProjectMember.create({
      projectId: project.id,
      userId: data.createdBy,
      role: "lead",
      joinedAt: new Date()
    });
    return projectRepo.findWithMembers(project.id);
  }

  async getByWorkspace(workspace_id) {
    return projectRepo.findByWorkspace(workspace_id);
  }

  async getByCompany(company_id) {
    return projectRepo.findByCompany(company_id);
  }

  async getById(id) {
    return projectRepo.findWithMembers(id);
  }

  async update(id, data) {
    return projectRepo.update(id, data);
  }

  async delete(id) {
    return projectRepo.delete(id);
  }

  async addMember(projectId, userId, role = "member") {
    return ProjectMember.create({ projectId, userId, role, joinedAt: new Date() });
  }

  async removeMember(projectId, userId) {
    const member = await ProjectMember.findOne({ where: { projectId, userId } });
    if (!member) throw new Error("Member not found");
    return member.destroy();
  }
}

module.exports = new ProjectService();
