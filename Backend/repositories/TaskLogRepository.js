const BaseRepository = require("./BaseRepository");
const { TaskLog, User } = require("../models");

class TaskLogRepository extends BaseRepository {
  constructor() {
    super(TaskLog);
  }

  async findByTask(task_id) {
    return this.model.findAll({
      where: { task_id },
      include: [{ model: User, attributes: ["id", "first_name", "last_name"] }],
      order: [["start_time", "DESC"]]
    });
  }

  async findByUser(user_id) {
    return this.model.findAll({ where: { user_id }, order: [["start_time", "DESC"]] });
  }
}

module.exports = new TaskLogRepository();
