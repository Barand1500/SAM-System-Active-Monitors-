const BaseRepository = require("./BaseRepository");
const { TaskComment } = require("../models");

class TaskCommentRepository extends BaseRepository {
  constructor() {
    super(TaskComment);
  }

  async findByTask(task_id) {
    return this.model.findAll({
      where: { task_id },
      order: [["created_at", "ASC"]]
    });
  }
}

module.exports = new TaskCommentRepository();