const express = require("express");
const router = express.Router();

// Auth
router.use("/auth", require("./auth"));

// Users
router.use("/users", require("./users"));

// Workspaces
router.use("/workspaces", require("./workspaces"));

// Projects
router.use("/projects", require("./projects"));

// Task Lists
router.use("/task-lists", require("./taskLists"));

// Tasks
router.use("/tasks", require("./tasks"));

// Task Comments
router.use("/task-comments", require("./taskComments"));

// Task Logs
router.use("/task-logs", require("./taskLogs"));

// Departments
router.use("/departments", require("./departments"));

// Attendance
router.use("/attendance", require("./attendance"));

// Leaves
router.use("/leaves", require("./leaves"));

// Files
router.use("/files", require("./files"));

// Notifications
router.use("/notifications", require("./notifications"));

// Announcements
router.use("/announcements", require("./announcements"));

// Reports
router.use("/reports", require("./reports"));

// Settings
router.use("/settings", require("./settings"));

// Dashboard
router.use("/dashboard", require("./dashboard"));

// Recurring Tasks
router.use("/recurring-tasks", require("./recurringTasks"));

// Automation Rules
router.use("/automation-rules", require("./automationRules"));

module.exports = router;
