const departmentRepo = require("../repositories/DepartmentRepository");

class DepartmentService {
  async create(data) {
    return departmentRepo.create(data);
  }

  async getByCompany(company_id) {
    return departmentRepo.findByCompany(company_id);
  }

  async getById(id) {
    return departmentRepo.findById(id);
  }

  async update(id, data) {
    return departmentRepo.update(id, data);
  }

  async delete(id) {
    return departmentRepo.delete(id);
  }
}

module.exports = new DepartmentService();
