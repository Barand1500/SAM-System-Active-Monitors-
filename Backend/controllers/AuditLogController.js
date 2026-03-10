const AuditLogService = require("../services/AuditLogService");

class AuditLogController {
  async list(req, res) {
    try {
      const { type, userId, limit, offset } = req.query;
      const result = await AuditLogService.list(req.user.company_id, {
        type,
        userId: userId ? Number(userId) : undefined,
        limit: limit ? Number(limit) : 500,
        offset: offset ? Number(offset) : 0,
      });
      res.json({ data: result.rows, total: result.count });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const { type, action, description, oldValue, newValue, entity } = req.body;
      const log = await AuditLogService.create({
        companyId: req.user.company_id,
        userId: req.user.id,
        userName: `${req.user.firstName || ""} ${req.user.lastName || ""}`.trim(),
        type,
        action,
        description,
        oldValue,
        newValue,
        entity,
      });
      res.status(201).json(log);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async clear(req, res) {
    try {
      await AuditLogService.clearByCompany(req.user.company_id);
      res.json({ message: "Geçmiş temizlendi" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AuditLogController();
