const express = require("express");
const router = express.Router();
const SupportTicketController = require("../controllers/SupportTicketController");
const { authenticate } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");
const upload = require("../middleware/upload");

// Stats & Status (must be before /:id)
router.get("/company/stats", authenticate, companyIsolation, SupportTicketController.getStats);
router.get("/status/:status", authenticate, companyIsolation, SupportTicketController.getByStatus);

// Ticket CRUD
router.get("/", authenticate, companyIsolation, SupportTicketController.list);
router.post("/", authenticate, companyIsolation, SupportTicketController.create);
router.get("/:id", authenticate, companyIsolation, SupportTicketController.get);
router.put("/:id", authenticate, companyIsolation, SupportTicketController.update);
router.delete("/:id", authenticate, companyIsolation, SupportTicketController.delete);

// Status Management
router.put("/:id/status", authenticate, companyIsolation, SupportTicketController.updateStatus);

// Reopen (tekrar aç)
router.put("/:id/reopen", authenticate, companyIsolation, SupportTicketController.reopen);

// Resolution History (geçmiş çözümler)
router.get("/:id/resolution-history", authenticate, companyIsolation, SupportTicketController.getResolutionHistory);

// Assignment
router.put("/:id/assign", authenticate, companyIsolation, SupportTicketController.assign);

// Messages
router.post("/:id/messages", authenticate, companyIsolation, upload.single('noteImage'), SupportTicketController.addMessage);
router.delete("/:id/messages/:messageId", authenticate, companyIsolation, SupportTicketController.deleteMessage);
router.post("/:id/files", authenticate, companyIsolation, SupportTicketController.addFile);

module.exports = router;
