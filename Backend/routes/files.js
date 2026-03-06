const express = require("express");
const router = express.Router();
const FileController = require("../controllers/FileController");
const { authenticate } = require("../middleware/authMiddleware");

// Dosya yükle
router.post("/", authenticate, FileController.uploadFile);

// Şirketin dosyalarını al
router.get("/company", authenticate, FileController.getFilesByCompany);

module.exports = router;