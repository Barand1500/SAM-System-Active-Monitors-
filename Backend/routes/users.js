// Backend/routes/users.js
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// Ensure avatars directory exists
const avatarsDir = path.join(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Multer storage configuration for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir);
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

// Multer error handling wrapper
const handleUpload = (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Yükleme hatası: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// User CRUD
router.get("/", authenticate, companyIsolation, UserController.list);
router.get("/:id", authenticate, companyIsolation, UserController.get);
router.post("/", authenticate, companyIsolation, authorizeRoles("boss", "manager"), UserController.create);
router.put("/:id", authenticate, companyIsolation, UserController.update);
router.put("/:id/skills", authenticate, companyIsolation, UserController.updateSkills);
router.post("/:id/avatar", authenticate, companyIsolation, handleUpload, UserController.uploadAvatar);
router.delete("/:id", authenticate, companyIsolation, authorizeRoles("boss", "manager"), UserController.delete);

module.exports = router;