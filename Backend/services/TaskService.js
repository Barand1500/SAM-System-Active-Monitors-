const taskRepo = require("../repositories/TaskRepository");
const { TaskAssignment, TaskHistory, User, TaskStatus, TaskPriority, Tag } = require("../models");

class TaskService {
  async create(data) {
    return taskRepo.create(data);
  }

  async getById(id, companyId) {
    return taskRepo.model.findOne({
      where: { id, companyId },
      include: [
        { model: User, as: "creator", attributes: ["id", "firstName", "lastName"] },
        { model: TaskStatus },
        { model: TaskPriority },
        { model: TaskAssignment, include: [{ model: User, attributes: ["id", "firstName", "lastName", "avatarUrl"] }] },
        { model: Tag }
      ]
    });
  }

  async getByTaskList(task_list_id) {
    return taskRepo.findByTaskList(task_list_id);
  }

  async getByCompany(companyId) {
    return taskRepo.findByCompany(companyId);
  }

  async update(id, data, companyId) {
    return taskRepo.update(id, data, companyId);
  }

  async delete(id, companyId) {
    return taskRepo.delete(id, companyId);
  }

  async assignUser(taskId, userId) {
    return TaskAssignment.create({ taskId, userId });
  }

  async removeAssignment(taskId, userId) {
    const assignment = await TaskAssignment.findOne({ where: { taskId, userId } });
    if (!assignment) throw new Error("Assignment not found");
    return assignment.destroy();
  }
}

module.exports = new TaskService();
