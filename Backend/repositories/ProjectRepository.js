const BaseRepository = require("./BaseRepository");
const { Project, ProjectMember, User, Workspace } = require("../models");

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  async findByWorkspace(workspace_id) {
    return this.model.findAll({
      where: { workspace_id },
      include: [{ model: ProjectMember, include: [{ model: User, attributes: ["id", "first_name", "last_name", "email", "avatar_url"] }] }],
      order: [["created_at", "DESC"]]
    });
  }

  async findByCompany(company_id) {
    const workspaces = await Workspace.findAll({ where: { company_id }, attributes: ["id"] });
    const wsIds = workspaces.map(w => w.id);
    if (wsIds.length === 0) return [];
    return this.model.findAll({
      where: { workspace_id: wsIds },
      include: [{ model: ProjectMember, include: [{ model: User, attributes: ["id", "first_name", "last_name", "email", "avatar_url"] }] }],
      order: [["created_at", "DESC"]]
    });
  }

  async findWithMembers(id) {
    return this.model.findByPk(id, {
      include: [{ model: ProjectMember, include: [{ model: User, attributes: ["id", "first_name", "last_name", "email", "avatar_url"] }] }]
    });
  }
}

module.exports = new ProjectRepository();
