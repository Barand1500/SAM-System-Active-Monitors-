const express = require("express");
const router = express.Router();
const CompanySettingController = require("../controllers/CompanySettingController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// Ensure logos directory exists
const logosDir = path.join(__dirname, "..", "uploads", "logos");
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

// Multer storage configuration for company logos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, logosDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString("hex") + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const allowedExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Sadece resim dosyaları yüklenebilir (jpg, png, gif, webp)"), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get("/", authenticate, CompanySettingController.get);
router.put("/", authenticate, authorizeRoles("boss"), CompanySettingController.update);

// Şirket Profili
router.get("/profile", authenticate, CompanySettingController.getProfile);
router.put("/profile", authenticate, authorizeRoles("boss"), CompanySettingController.updateProfile);
router.post("/profile/logo", authenticate, authorizeRoles("boss"), upload.single("logo"), CompanySettingController.uploadLogo);

// Dosya Klasörleri
router.get("/folders", authenticate, CompanySettingController.getFolders);
router.put("/folders", authenticate, CompanySettingController.updateFolders);

module.exports = router;
