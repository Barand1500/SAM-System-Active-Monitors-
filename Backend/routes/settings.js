const express = require("express");
const router = express.Router();
const CompanySettingController = require("../controllers/CompanySettingController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", authenticate, CompanySettingController.get);
router.put("/", authenticate, authorizeRoles("boss"), CompanySettingController.update);

// Şirket Profili
router.get("/profile", authenticate, CompanySettingController.getProfile);
router.put("/profile", authenticate, authorizeRoles("boss"), CompanySettingController.updateProfile);

// Dosya Klasörleri
router.get("/folders", authenticate, CompanySettingController.getFolders);
router.put("/folders", authenticate, CompanySettingController.updateFolders);

module.exports = router;
