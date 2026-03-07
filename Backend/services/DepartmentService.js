const departmentRepo = require("../repositories/DepartmentRepository");

class DepartmentService {
  async create(data) {
    return departmentRepo.create(data);
  }

  async getByCompany(company_id) {
    return departmentRepo.findByCompany(company_id);
  }

  async getById(id, companyId = null) {
    return departmentRepo.findById(id, companyId);
  }

  async update(id, data, companyId = null) {
    return departmentRepo.update(id, data, companyId);
  }

  async delete(id, companyId = null) {
    return departmentRepo.delete(id, companyId);
  }
}

module.exports = new DepartmentService();
