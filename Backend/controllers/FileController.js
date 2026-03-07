const FileService = require("../services/FileService");

class FileController {
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const data = {
        file_name: req.file.originalname,
        file_url: "/uploads/" + req.file.filename,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        company_id: req.user.company_id,
        uploaded_by: req.user.id
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