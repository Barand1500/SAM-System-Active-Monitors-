const CustomerService = require("../services/CustomerService");
const AuditLogService = require("../services/AuditLogService");

const logAudit = async (req, type, action, description, recordId, oldValue, newValue) => {
  try {
    await AuditLogService.create({
      companyId: req.user?.company_id || req.user?.companyId,
      userId: req.user?.id,
      userName: `${req.user?.firstName || req.user?.first_name || ''} ${req.user?.lastName || req.user?.last_name || ''}`.trim(),
      type, action, description, entity: 'Customer', tableName: 'customers', recordId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      ipAddress: req.ip
    });
  } catch (e) { /* audit hatası ana işlemi engellemesin */ }
};

class CustomerController {
  async create(req, res) {
    try {
      const customer = await CustomerService.create({
        ...req.body,
        companyId: req.user.company_id,
        createdBy: req.user.id
      });
      await logAudit(req, 'customer_created', 'CREATE', `Müşteri oluşturuldu: ${req.body.name || ''}`, customer.id, null, customer);
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
      await logAudit(req, 'customer_updated', 'UPDATE', `Müşteri güncellendi: ${customer.name || ''}`, req.params.id, null, req.body);
      res.json(customer);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await CustomerService.delete(req.params.id, req.user.company_id);
      await logAudit(req, 'customer_deleted', 'DELETE', `Müşteri silindi #${req.params.id}`, req.params.id, null, null);
      res.json({ message: "Customer deleted successfully" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new CustomerController();
