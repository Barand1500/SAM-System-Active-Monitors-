const BaseRepository = require("./BaseRepository");
const { Task } = require("../models");

class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }

  async findByTaskList(task_list_id) {
    return this.model.findAll({ where: { task_list_id } });
  }
}

module.exports = new TaskRepository();