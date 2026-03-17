const TaskPriorityService = require("../services/TaskPriorityService");

class TaskPriorityController {
  async list(req, res) {
    try {
      const priorities = await TaskPriorityService.getByCompany(req.user.company_id);
      res.json(priorities);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const priority = await TaskPriorityService.getById(req.params.id, req.user.company_id);
      if (!priority) return res.status(404).json({ error: "Öncelik bulunamadı" });
      res.json(priority);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const priority = await TaskPriorityService.create({
        ...req.body,
        companyId: req.user.company_id
      });
      res.status(201).json(priority);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const priority = await TaskPriorityService.update(req.params.id, req.body, req.user.company_id);
      res.json(priority);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await TaskPriorityService.delete(req.params.id, req.user.company_id);
      res.json({ message: "Silindi" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async reorder(req, res) {
    try {
      await TaskPriorityService.reorder(req.body.items, req.user.company_id);
      res.json({ message: "Sıralama güncellendi" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new TaskPriorityController();
