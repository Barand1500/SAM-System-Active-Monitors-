const taskPriorityRepo = require("../repositories/TaskPriorityRepository");

class TaskPriorityService {
  async getByCompany(company_id) {
    return taskPriorityRepo.findByCompany(company_id);
  }

  async getById(id, companyId) {
    return taskPriorityRepo.findById(id, companyId);
  }

  async create(data) {
    return taskPriorityRepo.create(data);
  }

  async update(id, data, companyId) {
    return taskPriorityRepo.update(id, data, companyId);
  }

  async delete(id, companyId) {
    return taskPriorityRepo.delete(id, companyId);
  }

  async reorder(items, companyId) {
    const promises = items.map((item, index) =>
      taskPriorityRepo.update(item.id, { orderNo: index }, companyId)
    );
    return Promise.all(promises);
  }
}

module.exports = new TaskPriorityService();
