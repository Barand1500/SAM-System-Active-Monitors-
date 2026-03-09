const BaseRepository = require("./BaseRepository");
const { Task, TaskStatus, TaskPriority, TaskAssignment, User } = require("../models");

class TaskRepository extends BaseRepository {
  constructor() {
    super(Task);
  }

  async findByTaskList(taskListId) {
    return this.model.findAll({ where: { taskListId } });
  }

  async findByCompany(companyId) {
    return this.model.findAll({
      where: { companyId },
      include: [
        { model: TaskStatus },
        { model: TaskPriority },
        { model: TaskAssignment, include: [{ model: User, attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] }] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName'] }
      ],
      order: [['created_at', 'DESC']]
    });
  }
}

module.exports = new TaskRepository();