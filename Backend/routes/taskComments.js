const express = require("express");
const router = express.Router();
const TaskCommentController = require("../controllers/TaskCommentController");
const { authenticate } = require("../middleware/authMiddleware");

// Yorum ekle
router.post("/", authenticate, TaskCommentController.addComment);

// Task'a ait yorumları al
router.get("/task/:taskId", authenticate, TaskCommentController.getComments);

module.exports = router;