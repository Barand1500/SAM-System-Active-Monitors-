const TaskRepository = require("../repositories/TaskRepository");

class TaskController {
  async createTask(req, res) {
    try {
      const task = await TaskRepository.create(req.body);
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getTasksByList(req, res) {
    try {
      const tasks = await TaskRepository.findByTaskList(req.params.listId);
      res.json(tasks);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new TaskController();