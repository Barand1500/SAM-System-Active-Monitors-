const taskRepo = require("../repositories/TaskRepository");
const { TaskAssignment, TaskHistory, User, TaskStatus, TaskPriority, Tag } = require("../models");

class TaskService {
  async create(data) {
    return taskRepo.create(data);
  }

  async getById(id) {
    return taskRepo.model.findByPk(id, {
      include: [
        { model: User, as: "creator", attributes: ["id", "first_name", "last_name"] },
        { model: TaskStatus },
        { model: TaskPriority },
        { model: TaskAssignment, include: [{ model: User, attributes: ["id", "first_name", "last_name", "avatar_url"] }] },
        { model: Tag }
      ]
    });
  }

  async getByTaskList(task_list_id) {
    return taskRepo.findByTaskList(task_list_id);
  }

  async update(id, data) {
    return taskRepo.update(id, data);
  }

  async delete(id) {
    return taskRepo.delete(id);
  }

  async assignUser(task_id, user_id) {
    return TaskAssignment.create({ task_id, user_id });
  }

  async removeAssignment(task_id, user_id) {
    const assignment = await TaskAssignment.findOne({ where: { task_id, user_id } });
    if (!assignment) throw new Error("Assignment not found");
    return assignment.destroy();
  }
}

module.exports = new TaskService();
