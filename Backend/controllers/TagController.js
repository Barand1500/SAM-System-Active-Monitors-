const tagService = require("../services/TagService");

class TagController {
  async list(req, res) {
    try {
      const tags = await tagService.list(req.user.company_id);
      res.json(tags);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async create(req, res) {
    try {
      const { name, color } = req.body;
      if (!name) return res.status(400).json({ message: "Etiket adı zorunludur" });
      const tag = await tagService.create({
        companyId: req.user.company_id,
        name,
        color: color || "#6366f1",
      });
      res.status(201).json(tag);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async update(req, res) {
    try {
      const tag = await tagService.update(req.params.id, req.user.company_id, req.body);
      res.json(tag);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  }

  async delete(req, res) {
    try {
      await tagService.delete(req.params.id, req.user.company_id);
      res.json({ message: "Etiket silindi" });
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  }
}

module.exports = new TagController();
