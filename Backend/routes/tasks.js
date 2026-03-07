const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");
const { authenticate } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");
const { validate, rules } = require("../middleware/ValidationMiddleware");

// Task CRUD
router.post("/", authenticate, companyIsolation, rules.createTask, validate, TaskController.createTask);
router.get("/list/:listId", authenticate, companyIsolation, TaskController.getTasksByList);
router.get("/:id", authenticate, companyIsolation, TaskController.getTask);
router.put("/:id", authenticate, companyIsolation, TaskController.updateTask);
router.delete("/:id", authenticate, companyIsolation, TaskController.deleteTask);

// Task Assignments
router.post("/:id/assign", authenticate, companyIsolation, TaskController.assignUser);
router.delete("/:id/assign/:userId", authenticate, companyIsolation, TaskController.removeAssignment);

module.exports = router;