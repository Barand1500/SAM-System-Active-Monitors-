const express = require("express");
const router = express.Router();
const SettingsController = require("../controllers/SettingsController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", authenticate, SettingsController.get);
router.put("/", authenticate, authorizeRoles("boss"), SettingsController.update);

module.exports = router;
