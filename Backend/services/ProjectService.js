const projectRepo = require("../repositories/ProjectRepository");
const { ProjectMember } = require("../models");

class ProjectService {
  async create(data) {
    const project = await projectRepo.create(data);
    // Oluşturanı lead olarak ekle
    await ProjectMember.create({
      project_id: project.id,
      user_id: data.created_by,
      role: "lead",
      joined_at: new Date()
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

  async addMember(project_id, user_id, role = "member") {
    return ProjectMember.create({ project_id, user_id, role, joined_at: new Date() });
  }

  async removeMember(project_id, user_id) {
    const member = await ProjectMember.findOne({ where: { project_id, user_id } });
    if (!member) throw new Error("Member not found");
    return member.destroy();
  }
}

module.exports = new ProjectService();
