const TaskLogService = require("../services/TaskLogService");

class TaskLogController {
  async list(req, res) {
    try {
      const logs = await TaskLogService.getByTask(req.params.taskId);
      res.json(logs);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const log = await TaskLogService.create({
        ...req.body,
        user_id: req.user.id
      });
      res.status(201).json(log);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const log = await TaskLogService.update(req.params.id, req.body);
      res.json(log);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await TaskLogService.delete(req.params.id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new TaskLogController();
