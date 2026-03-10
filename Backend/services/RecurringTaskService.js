const { RecurringTask } = require("../models");

class RecurringTaskService {
  async create(data) {
    return RecurringTask.create(data);
  }

  async getByCompany(company_id) {
    return RecurringTask.findAll({ where: { company_id }, order: [["created_at", "DESC"]] });
  }

  async getById(id) {
    return RecurringTask.findByPk(id);
  }

  async update(id, data) {
    const task = await RecurringTask.findByPk(id);
    if (!task) throw new Error("Recurring task not found");
    return task.update(data);
  }

  async delete(id) {
    const task = await RecurringTask.findByPk(id);
    if (!task) throw new Error("Recurring task not found");
    return task.destroy();
  }

  async toggleActive(id) {
    const task = await RecurringTask.findByPk(id);
    if (!task) throw new Error("Recurring task not found");
    task.isActive = !task.isActive;
    await task.save();
    return task;
  }
}

module.exports = new RecurringTaskService();
