const express = require("express");
const router = express.Router();
const FileController = require("../controllers/FileController");
const { authenticate } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");
const upload = require("../middleware/upload");

router.use(authenticate, companyIsolation);

// Dosya yükle (gerçek dosya upload - multer)
router.post("/", upload.single("file"), FileController.uploadFile);

// Şirketin dosyalarını al
router.get("/company", FileController.getFilesByCompany);

// Dosya sil
router.delete("/:id", FileController.deleteFile);

module.exports = router;