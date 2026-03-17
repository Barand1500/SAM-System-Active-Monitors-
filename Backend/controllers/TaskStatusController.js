const TaskStatusService = require("../services/TaskStatusService");

class TaskStatusController {
  async list(req, res) {
    try {
      const statuses = await TaskStatusService.getByCompany(req.user.company_id);
      res.json(statuses);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const status = await TaskStatusService.getById(req.params.id, req.user.company_id);
      if (!status) return res.status(404).json({ error: "Durum bulunamadı" });
      res.json(status);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const status = await TaskStatusService.create({
        ...req.body,
        companyId: req.user.company_id
      });
      res.status(201).json(status);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const status = await TaskStatusService.update(req.params.id, req.body, req.user.company_id);
      res.json(status);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await TaskStatusService.delete(req.params.id, req.user.company_id);
      res.json({ message: "Silindi" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async reorder(req, res) {
    try {
      await TaskStatusService.reorder(req.body.items, req.user.company_id);
      res.json({ message: "Sıralama güncellendi" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new TaskStatusController();
