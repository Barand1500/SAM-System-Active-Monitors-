// Backend/controllers/AnnouncementController.js
const AnnouncementRepo = require("../repositories/AnnouncementRepository");

class AnnouncementController {
  async list(req, res) {
    try {
      const announcements = await AnnouncementRepo.getByCompany(req.user.company_id);
      res.json(announcements);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const announcement = await AnnouncementRepo.create({
        ...req.body,
        company_id: req.user.company_id,
        user_id: req.user.id,
      });
      res.status(201).json(announcement);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const announcement = await AnnouncementRepo.model.findByPk(req.params.id);
      if (!announcement) return res.status(404).json({ error: "Not found" });
      Object.assign(announcement, req.body);
      await announcement.save();
      res.json(announcement);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const announcement = await AnnouncementRepo.model.findByPk(req.params.id);
      if (!announcement) return res.status(404).json({ error: "Not found" });
      await announcement.destroy();
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AnnouncementController();