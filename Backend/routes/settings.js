const express = require("express");
const router = express.Router();
const CompanySettingController = require("../controllers/CompanySettingController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", authenticate, CompanySettingController.get);
router.put("/", authenticate, authorizeRoles("boss"), CompanySettingController.update);

module.exports = router;
