const TaskListService = require("../services/TaskListService");

class TaskListController {
  async list(req, res) {
    try {
      if (!req.params.projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }
      const lists = await TaskListService.getByProject(req.params.projectId);
      res.json(lists || []);
    } catch (err) {
      console.error('[TaskListController] list error:', err.message);
      res.status(500).json({ error: "Failed to fetch task lists" });
    }
  }

  async get(req, res) {
    try {
      const list = await TaskListService.getById(req.params.id);
      if (!list) return res.status(404).json({ error: "Task list not found" });
      res.json(list);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      if (!req.body.projectId) {
        return res.status(400).json({ error: "Project ID is required" });
      }
      const list = await TaskListService.create(req.body);
      res.status(201).json(list);
    } catch (err) {
      console.error('[TaskListController] create error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const list = await TaskListService.update(req.params.id, req.body);
      res.json(list);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await TaskListService.delete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new TaskListController();
