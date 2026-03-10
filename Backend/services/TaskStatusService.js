const taskStatusRepo = require("../repositories/TaskStatusRepository");

class TaskStatusService {
  async getByCompany(company_id) {
    return taskStatusRepo.findByCompany(company_id);
  }

  async getById(id, companyId) {
    return taskStatusRepo.findById(id, companyId);
  }

  async create(data) {
    return taskStatusRepo.create(data);
  }

  async update(id, data, companyId) {
    return taskStatusRepo.update(id, data, companyId);
  }

  async delete(id, companyId) {
    return taskStatusRepo.delete(id, companyId);
  }

  async reorder(items, companyId) {
    const promises = items.map((item, index) =>
      taskStatusRepo.update(item.id, { orderNo: index }, companyId)
    );
    return Promise.all(promises);
  }
}

module.exports = new TaskStatusService();
