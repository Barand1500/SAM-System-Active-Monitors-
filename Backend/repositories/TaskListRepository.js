// Backend/repositories/TaskListRepository.js
const BaseRepository = require("./BaseRepository");
const { TaskList, Project } = require("../models");

class TaskListRepository extends BaseRepository {
  constructor() {
    super(TaskList);
  }

  async getByProject(project_id) {
    return this.model.findAll({
      where: { project_id },
      order: [['order_no', 'ASC']],
      include: [{ model: Project }],
    });
  }
}

module.exports = new TaskListRepository();