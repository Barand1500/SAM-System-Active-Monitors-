const PersonalNoteService = require("../services/PersonalNoteService");

class PersonalNoteController {
  async list(req, res) {
    try {
      const grouped = await PersonalNoteService.getByUser(req.user.id, req.user.company_id);
      res.json(grouped);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const { noteDate, text } = req.body;
      if (!noteDate || !text?.trim()) {
        return res.status(400).json({ error: "noteDate ve text zorunludur" });
      }
      const note = await PersonalNoteService.create(req.user.id, req.user.company_id, noteDate, text.trim());
      res.status(201).json(note);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { text } = req.body;
      if (!text?.trim()) {
        return res.status(400).json({ error: "text zorunludur" });
      }
      const note = await PersonalNoteService.update(Number(req.params.id), req.user.id, text.trim());
      res.json(note);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      await PersonalNoteService.delete(Number(req.params.id), req.user.id);
      res.json({ message: "Not silindi" });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new PersonalNoteController();
