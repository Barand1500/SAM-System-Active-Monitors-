const FileService = require("../services/FileService");
const path = require("path");

class FileController {
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      let tags = [];
      if (req.body.tags) {
        try { tags = JSON.parse(req.body.tags); } catch { tags = []; }
      }
      const data = {
        fileName: req.file.originalname,
        fileUrl: "/uploads/" + req.file.filename,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        companyId: req.user.company_id,
        uploadedBy: req.user.id,
        folderId: req.body.folderId || "root",
        tags: tags
      };
      const file = await FileService.create(data);
      res.status(201).json(file);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getFilesByCompany(req, res) {
    try {
      const files = await FileService.getByCompany(req.user.company_id);
      res.json(files);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async downloadFile(req, res) {
    try {
      const file = await FileService.download(req.params.id, req.user.company_id);
      const filePath = path.join(__dirname, "..", file.fileUrl);
      res.download(filePath, file.fileName);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteFile(req, res) {
    try {
      await FileService.delete(req.params.id, req.user.company_id);
      res.json({ message: "Deleted" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new FileController();