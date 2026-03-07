const taskListRepo = require("../repositories/TaskListRepository");

class TaskListService {
  async getByProject(project_id) {
    return taskListRepo.getByProject(project_id);
  }

  async getById(id) {
    return taskListRepo.findById(id);
  }

  async create(data) {
    return taskListRepo.create(data);
  }

  async update(id, data) {
    return taskListRepo.update(id, data);
  }

  async delete(id) {
    return taskListRepo.delete(id);
  }
}

module.exports = new TaskListService();
