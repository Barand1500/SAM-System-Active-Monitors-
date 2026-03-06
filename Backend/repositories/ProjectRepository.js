const BaseRepository = require("./BaseRepository");
const { Project, ProjectMember, User } = require("../models");

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  async findByWorkspace(workspace_id) {
    return this.model.findAll({ where: { workspace_id } });
  }

  async findWithMembers(id) {
    return this.model.findByPk(id, {
      include: [{ model: ProjectMember, include: [{ model: User, attributes: ["id", "first_name", "last_name", "email", "avatar_url"] }] }]
    });
  }
}

module.exports = new ProjectRepository();
