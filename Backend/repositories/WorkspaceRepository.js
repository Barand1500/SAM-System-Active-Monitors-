const BaseRepository = require("./BaseRepository");
const { Workspace, WorkspaceMember, User } = require("../models");

class WorkspaceRepository extends BaseRepository {
  constructor() {
    super(Workspace);
  }

  async findByCompany(company_id) {
    return this.model.findAll({ where: { company_id } });
  }

  async findWithMembers(id) {
    return this.model.findByPk(id, {
      include: [{ model: WorkspaceMember, include: [{ model: User, attributes: ["id", "first_name", "last_name", "email", "avatar_url"] }] }]
    });
  }
}

module.exports = new WorkspaceRepository();
