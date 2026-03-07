const BaseRepository = require("./BaseRepository");
const { TaskComment } = require("../models");

class TaskCommentRepository extends BaseRepository {
  constructor() {
    super(TaskComment);
  }

  async findByTask(task_id) {
    const { User } = require("../models");
    return this.model.findAll({
      where: { task_id },
      include: [{ model: User, attributes: ["id", "first_name", "last_name", "email", "avatar_url"] }],
      order: [["created_at", "ASC"]]
    });
  }
}

module.exports = new TaskCommentRepository();