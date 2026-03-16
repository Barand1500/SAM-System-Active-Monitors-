const express = require("express");
const router = express.Router();
const autoAuditLog = require("../middleware/autoAuditLog");

// Auth
router.use("/auth", autoAuditLog({ type: "auth" }), require("./auth"));

// Users
router.use("/users", require("./users"));

// Workspaces
router.use("/workspaces", autoAuditLog({ type: "workspace" }), require("./workspaces"));

// Projects
router.use("/projects", require("./projects"));

// Task Lists
router.use("/task-lists", autoAuditLog({ type: "task-list" }), require("./taskLists"));

// Tasks
router.use("/tasks", require("./tasks"));

// Task Comments
router.use("/task-comments", autoAuditLog({ type: "task-comment" }), require("./taskComments"));

// Task Logs
router.use("/task-logs", autoAuditLog({ type: "task-log" }), require("./taskLogs"));

// Departments
router.use("/departments", require("./departments"));

// Attendance
router.use("/attendance", require("./attendance"));

// Leaves
router.use("/leaves", require("./leaves"));

// Files
router.use("/files", autoAuditLog({ type: "file" }), require("./files"));

// Notifications
router.use("/notifications", autoAuditLog({ type: "notification" }), require("./notifications"));

// Announcements
router.use("/announcements", require("./announcements"));

// Reports
router.use("/reports", autoAuditLog({ type: "report" }), require("./reports"));

// Settings
router.use("/settings", autoAuditLog({ type: "setting" }), require("./settings"));

// Dashboard
router.use("/dashboard", autoAuditLog({ type: "dashboard" }), require("./dashboard"));

// Recurring Tasks
router.use("/recurring-tasks", autoAuditLog({ type: "recurring-task" }), require("./recurringTasks"));

// Audit Logs
router.use("/audit-logs", require("./auditLogs"));

// Personal Notes
router.use("/personal-notes", autoAuditLog({ type: "personal-note" }), require("./personalNotes"));

// Contacts (Rehber)
router.use("/contacts", autoAuditLog({ type: "contact" }), require("./contacts"));

// Tags (Etiketler)
router.use("/tags", autoAuditLog({ type: "tag" }), require("./tags"));

// Roles (Roller)
router.use("/roles", autoAuditLog({ type: "role" }), require("./roles"));

// Dashboard Settings
router.use("/dashboard-settings", autoAuditLog({ type: "dashboard" }), require("./dashboardSettings"));

// Automation Rules
router.use("/automation-rules", autoAuditLog({ type: "automation-rule" }), require("./automationRules"));

// Surveys
router.use("/surveys", autoAuditLog({ type: "survey" }), require("./surveys"));

// Support Tickets
router.use("/support-tickets", require("./supportTickets"));

// Customers
router.use("/customers", require("./customers"));

// Task Statuses
router.use("/task-statuses", autoAuditLog({ type: "task-status" }), require("./taskStatuses"));

// Task Priorities
router.use("/task-priorities", autoAuditLog({ type: "task-priority" }), require("./taskPriorities"));

// SMS
router.use("/sms", autoAuditLog({ type: "sms" }), require("./sms"));

// System (Restart & Health)
router.use("/system", autoAuditLog({ type: "system" }), require("./system"));

module.exports = router;
