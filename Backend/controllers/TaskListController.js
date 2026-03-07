const TaskListService = require("../services/TaskListService");

class TaskListController {
  async list(req, res) {
    try {
      const lists = await TaskListService.getByProject(req.params.projectId);
      res.json(lists);
    } catch (err) {
      res.status(400).json({ error: err.message });
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
      const list = await TaskListService.create(req.body);
      res.status(201).json(list);
    } catch (err) {
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
