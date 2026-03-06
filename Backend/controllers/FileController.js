const FileRepo = require("../repositories/FileRepository");

class FileController {
  async uploadFile(req, res) {
    try {
      // req.body.file_name, req.body.file_url
      const data = {
        ...req.body,
        company_id: req.user.company_id,
        uploaded_by: req.user.id
      };
      const file = await FileRepo.create(data);
      res.status(201).json(file);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getFilesByCompany(req, res) {
    try {
      const files = await FileRepo.findByCompany(req.user.company_id);
      res.json(files);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new FileController();