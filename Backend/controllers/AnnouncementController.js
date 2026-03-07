// Backend/controllers/AnnouncementController.js
const AnnouncementService = require("../services/AnnouncementService");

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
      res.status(201).json(announcement);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { company_id, user_id, id, ...safeData } = req.body;
      const updated = await AnnouncementService.update(req.params.id, safeData);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await AnnouncementService.delete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AnnouncementController();