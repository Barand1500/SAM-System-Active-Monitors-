const taskCommentRepo = require("../repositories/TaskCommentRepository");

class TaskCommentService {
  async create(data) {
    return taskCommentRepo.create(data);
  }

  async getByTask(task_id) {
    return taskCommentRepo.findByTask(task_id);
  }

  async update(id, data) {
    return taskCommentRepo.update(id, data);
  }

  async delete(id) {
    return taskCommentRepo.delete(id);
  }
}

module.exports = new TaskCommentService();
