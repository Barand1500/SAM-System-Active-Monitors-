const RecurringTaskService = require("../services/RecurringTaskService");

class RecurringTaskController {
  async list(req, res) {
    try {
      const tasks = await RecurringTaskService.getByCompany(req.body.company_id || req.query.company_id);
      res.json(tasks);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const task = await RecurringTaskService.getById(req.params.id);
      if (!task) return res.status(404).json({ error: "Recurring task not found" });
      if (String(task.companyId) !== String(req.body.company_id || req.query.company_id)) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(task);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const { company_id, id, ...safeData } = req.body;
      safeData.company_id = req.user.company_id;
      safeData.created_by = req.user.id;
      const task = await RecurringTaskService.create(safeData);
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const task = await RecurringTaskService.getById(req.params.id);
      if (!task) return res.status(404).json({ error: "Recurring task not found" });
      if (String(task.companyId) !== String(req.user.company_id)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { company_id, id, created_by, ...safeData } = req.body;
      const updated = await RecurringTaskService.update(req.params.id, safeData);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const task = await RecurringTaskService.getById(req.params.id);
      if (!task) return res.status(404).json({ error: "Recurring task not found" });
      if (String(task.companyId) !== String(req.user.company_id)) {
        return res.status(403).json({ error: "Access denied" });
      }
      await RecurringTaskService.delete(req.params.id);
      res.json({ message: "Recurring task deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async toggleActive(req, res) {
    try {
      const task = await RecurringTaskService.getById(req.params.id);
      if (!task) return res.status(404).json({ error: "Recurring task not found" });
      if (String(task.companyId) !== String(req.user.company_id)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const updated = await RecurringTaskService.toggleActive(req.params.id);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new RecurringTaskController();
