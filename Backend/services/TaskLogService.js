const taskLogRepo = require("../repositories/TaskLogRepository");

class TaskLogService {
  async create(data) {
    return taskLogRepo.create(data);
  }

  async getByTask(task_id) {
    return taskLogRepo.findByTask(task_id);
  }

  async getByUser(user_id) {
    return taskLogRepo.findByUser(user_id);
  }

  async update(id, data) {
    return taskLogRepo.update(id, data);
  }

  async delete(id) {
    return taskLogRepo.delete(id);
  }
}

module.exports = new TaskLogService();
