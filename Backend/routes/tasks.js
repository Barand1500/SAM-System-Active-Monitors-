const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");
const { authenticate } = require("../middleware/authMiddleware");

// Yeni görev oluştur
router.post("/", authenticate, TaskController.createTask);

// Listeye göre görevleri al
router.get("/list/:listId", authenticate, TaskController.getTasksByList);

module.exports = router;