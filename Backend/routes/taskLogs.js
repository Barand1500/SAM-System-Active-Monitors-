const express = require("express");
const router = express.Router();
const TaskLogController = require("../controllers/TaskLogController");
const { authenticate } = require("../middleware/authMiddleware");

router.get("/task/:taskId", authenticate, TaskLogController.list);
router.post("/", authenticate, TaskLogController.create);
router.put("/:id", authenticate, TaskLogController.update);
router.delete("/:id", authenticate, TaskLogController.delete);

module.exports = router;
