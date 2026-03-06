const express = require("express");
const router = express.Router();
const TaskListController = require("../controllers/TaskListController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/project/:projectId", authenticate, TaskListController.list);
router.get("/:id", authenticate, TaskListController.get);
router.post("/", authenticate, TaskListController.create);
router.put("/:id", authenticate, TaskListController.update);
router.delete("/:id", authenticate, TaskListController.delete);

module.exports = router;
