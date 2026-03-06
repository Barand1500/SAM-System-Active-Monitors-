const TaskCommentRepo = require("../repositories/TaskCommentRepository");

class TaskCommentController {
  async addComment(req, res) {
    try {
      const data = {
        ...req.body,
        user_id: req.user.id
      };
      const comment = await TaskCommentRepo.create(data);
      res.status(201).json(comment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getComments(req, res) {
    try {
      const comments = await TaskCommentRepo.findByTask(req.params.taskId);
      res.json(comments);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new TaskCommentController();