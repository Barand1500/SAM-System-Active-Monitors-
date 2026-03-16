const DepartmentService = require("../services/DepartmentService");
const AuditLogService = require("../services/AuditLogService");

const logAudit = async (req, type, action, description, recordId, oldValue, newValue) => {
  try {
    await AuditLogService.create({
      companyId: req.user?.company_id || req.user?.companyId,
      userId: req.user?.id,
      userName: `${req.user?.firstName || req.user?.first_name || ''} ${req.user?.lastName || req.user?.last_name || ''}`.trim(),
      type, action, description, entity: 'Department', tableName: 'departments', recordId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      ipAddress: req.ip
    });
  } catch (e) { /* audit hatası ana işlemi engellemesin */ }
};

class DepartmentController {
  async list(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const departments = await DepartmentService.getByCompany(companyId);
      res.json(departments || []);
    } catch (err) {
      console.error('[DepartmentController] list error:', err.message);
      res.status(500).json({ error: "Failed to fetch departments" });
    }
  }

  async get(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const department = await DepartmentService.getById(req.params.id, companyId);
      if (!department) return res.status(404).json({ error: "Department not found" });
      res.json(department);
    } catch (err) {
      console.error('[DepartmentController] get error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const department = await DepartmentService.create({
        ...req.body,
        companyId: companyId
      });
      await logAudit(req, 'department_created', 'CREATE', `Departman oluşturuldu: ${req.body.name || ''}`, department.id, null, department);
      res.status(201).json(department);
    } catch (err) {
      console.error('[DepartmentController] create error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const department = await DepartmentService.update(req.params.id, req.body, companyId);
      await logAudit(req, 'department_updated', 'UPDATE', `Departman güncellendi: ${department.name || ''}`, req.params.id, null, req.body);
      res.json(department);
    } catch (err) {
      console.error('[DepartmentController] update error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      await DepartmentService.delete(req.params.id, companyId);
      await logAudit(req, 'department_deleted', 'DELETE', `Departman silindi #${req.params.id}`, req.params.id, null, null);
      res.json({ message: "Deleted" });
    } catch (err) {
      console.error('[DepartmentController] delete error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new DepartmentController();
