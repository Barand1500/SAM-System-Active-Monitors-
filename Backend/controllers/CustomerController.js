const CustomerService = require("../services/CustomerService");

class CustomerController {
  async create(req, res) {
    try {
      const customer = await CustomerService.create({
        ...req.body,
        companyId: req.user.company_id,
        createdBy: req.user.id
      });
      res.status(201).json(customer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const filters = {};
      if (req.query.type) filters.type = req.query.type;
      if (req.query.sector) filters.sector = req.query.sector;

      const customers = await CustomerService.getByCompany(req.user.company_id, filters);
      res.json(customers);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const customer = await CustomerService.getById(req.params.id, req.user.company_id);
      res.json(customer);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const customer = await CustomerService.update(req.params.id, req.body, req.user.company_id);
      res.json(customer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await CustomerService.delete(req.params.id, req.user.company_id);
      res.json({ message: "Customer deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new CustomerController();
