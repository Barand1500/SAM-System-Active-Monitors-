const express = require("express");
const router = express.Router();
const SupportTicketController = require("../controllers/SupportTicketController");
const { authenticate } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

// Ticket CRUD
router.get("/", authenticate, companyIsolation, SupportTicketController.list);
router.post("/", authenticate, companyIsolation, SupportTicketController.create);
router.get("/:id", authenticate, companyIsolation, SupportTicketController.get);
router.put("/:id", authenticate, companyIsolation, SupportTicketController.update);
router.delete("/:id", authenticate, companyIsolation, SupportTicketController.delete);

// Status Management
router.put("/:id/status", authenticate, companyIsolation, SupportTicketController.updateStatus);
router.get("/status/:status", authenticate, companyIsolation, SupportTicketController.getByStatus);

// Assignment
router.put("/:id/assign", authenticate, companyIsolation, SupportTicketController.assign);

// Messages
router.post("/:id/messages", authenticate, companyIsolation, SupportTicketController.addMessage);
router.post("/:id/files", authenticate, companyIsolation, SupportTicketController.addFile);

// Stats
router.get("/company/stats", authenticate, companyIsolation, SupportTicketController.getStats);

module.exports = router;
