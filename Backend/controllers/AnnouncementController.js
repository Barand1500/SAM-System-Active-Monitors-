// Backend/controllers/AnnouncementController.js
const AnnouncementService = require("../services/AnnouncementService");
const AuditLogService = require("../services/AuditLogService");

const logAudit = async (req, type, action, description, recordId) => {
  try {
    await AuditLogService.create({
      companyId: req.user?.company_id || req.user?.companyId,
      userId: req.user?.id,
      userName: `${req.user?.firstName || req.user?.first_name || ''} ${req.user?.lastName || req.user?.last_name || ''}`.trim(),
      type, action, description, entity: 'Announcement', tableName: 'announcements', recordId,
      ipAddress: req.ip
    });
  } catch (e) { /* audit hatası ana işlemi engellemesin */ }
};

class AnnouncementController {
  async list(req, res) {
    try {
      const announcements = await AnnouncementService.getByCompany(req.user.company_id);
      res.json(announcements);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const { company_id, user_id, id, ...safeData } = req.body;
      safeData.company_id = req.user.company_id;
      safeData.user_id = req.user.id;
      const announcement = await AnnouncementService.create(safeData);
      await logAudit(req, 'announcement_created', 'CREATE', `Duyuru oluşturuldu: ${safeData.title || ''}`, announcement.id);
      res.status(201).json(announcement);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { company_id, user_id, id, ...safeData } = req.body;
      const updated = await AnnouncementService.update(req.params.id, safeData);
      await logAudit(req, 'announcement_updated', 'UPDATE', `Duyuru güncellendi #${req.params.id}`, req.params.id);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await AnnouncementService.delete(req.params.id);
      await logAudit(req, 'announcement_deleted', 'DELETE', `Duyuru silindi #${req.params.id}`, req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AnnouncementController();