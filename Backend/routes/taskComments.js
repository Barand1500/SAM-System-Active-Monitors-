const express = require("express");
const router = express.Router();
const TaskCommentController = require("../controllers/TaskCommentController");
const { authenticate } = require("../middleware/authMiddleware");

// Yorum CRUD
router.post("/", authenticate, TaskCommentController.addComment);
router.get("/task/:taskId", authenticate, TaskCommentController.getComments);
router.put("/:id", authenticate, TaskCommentController.updateComment);
router.delete("/:id", authenticate, TaskCommentController.deleteComment);

module.exports = router;