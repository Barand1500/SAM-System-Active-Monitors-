const TaskCommentService = require("../services/TaskCommentService");

class TaskCommentController {
  async addComment(req, res) {
    try {
      const data = {
        ...req.body,
        user_id: req.user.id
      };
      const comment = await TaskCommentService.create(data);
      res.status(201).json(comment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getComments(req, res) {
    try {
      const comments = await TaskCommentService.getByTask(req.params.taskId);
      res.json(comments);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateComment(req, res) {
    try {
      const comment = await TaskCommentService.update(req.params.id, {
        comment_text: req.body.comment_text
      });
      res.json(comment);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteComment(req, res) {
    try {
      await TaskCommentService.delete(req.params.id);
      res.json({ message: "Yorum başarıyla silindi" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new TaskCommentController();