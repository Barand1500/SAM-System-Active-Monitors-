const projectRepo = require("../repositories/ProjectRepository");
const { ProjectMember } = require("../models");

class ProjectService {
  async create(data) {
    const project = await projectRepo.create(data);
    // Oluşturanı lead olarak ekle
    await ProjectMember.create({
      projectId: project.id,
      userId: data.createdBy,
      role: "lead",
      joinedAt: new Date()
    });
    return project;
  }

  async getByWorkspace(workspace_id) {
    return projectRepo.findByWorkspace(workspace_id);
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
