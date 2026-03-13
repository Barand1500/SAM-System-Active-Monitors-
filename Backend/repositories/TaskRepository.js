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
    try {
      return await this.model.findAll({
        where: { companyId },
        include: [
          { 
            model: TaskStatus,
            required: false,
            attributes: ['id', 'name', 'color']
          },
          { 
            model: TaskPriority,
            required: false,
            attributes: ['id', 'name', 'color']
          },
          { 
            model: TaskAssignment,
            required: false,
            include: [{ 
              model: User, 
              required: false,
              attributes: ['id', 'firstName', 'lastName', 'avatarUrl'] 
            }]
          },
          { 
            model: User, 
            as: 'creator',
            required: false,
            attributes: ['id', 'firstName', 'lastName'] 
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 1000 // Limit ekle
      });
    } catch (error) {
      console.error('TaskRepository.findByCompany error:', error);
      throw error;
    }
  }
}

module.exports = new TaskRepository();