const express = require("express");
const router = express.Router();
const SmsController = require("../controllers/SmsController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.use(authenticate);

// Groups
router.get("/groups", SmsController.listGroups);
router.post("/groups", authorizeRoles("boss", "manager"), SmsController.createGroup);
router.put("/groups/:id", authorizeRoles("boss", "manager"), SmsController.updateGroup);
router.delete("/groups/:id", authorizeRoles("boss", "manager"), SmsController.deleteGroup);

// History + Send
router.get("/history", SmsController.listHistory);
router.post("/send", authorizeRoles("boss", "manager"), SmsController.send);

module.exports = router;
