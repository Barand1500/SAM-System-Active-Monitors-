const customerRepo = require("../repositories/CustomerRepository");

class CustomerService {
  async create(data) {
    return customerRepo.create(data);
  }

  async getByCompany(companyId, filters = {}) {
    return customerRepo.findByCompany(companyId, filters);
  }

  async getById(id, companyId) {
    const customer = await customerRepo.findOneByCompany(id, companyId);
    if (!customer) throw new Error("Müşteri bulunamadı");
    return customer;
  }

  async update(id, data, companyId) {
    return customerRepo.update(id, data, companyId);
  }

  async delete(id, companyId) {
    return customerRepo.deleteByCompany(id, companyId);
  }
}

module.exports = new CustomerService();
