const taskListRepo = require("../repositories/TaskListRepository");

class TaskListController {
  async list(req, res) {
    try {
      const lists = await taskListRepo.getByProject(req.params.projectId);
      res.json(lists);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const list = await taskListRepo.findById(req.params.id);
      if (!list) return res.status(404).json({ error: "Task list not found" });
      res.json(list);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const list = await taskListRepo.create(req.body);
      res.status(201).json(list);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const list = await taskListRepo.update(req.params.id, req.body);
      res.json(list);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await taskListRepo.delete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new TaskListController();
