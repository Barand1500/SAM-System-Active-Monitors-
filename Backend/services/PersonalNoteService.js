const personalNoteRepo = require("../repositories/PersonalNoteRepository");

class PersonalNoteService {
  async getByUser(userId, companyId) {
    const notes = await personalNoteRepo.findByUser(userId, companyId);
    // Frontend formatına dönüştür: { "2026-03-10": [{ id, text, createdAt }], ... }
    const grouped = {};
    for (const note of notes) {
      const dateStr = note.noteDate;
      if (!grouped[dateStr]) grouped[dateStr] = [];
      grouped[dateStr].push({
        id: note.id,
        text: note.text,
        createdAt: note.createdAt,
      });
    }
    return grouped;
  }

  async create(userId, companyId, noteDate, text) {
    return personalNoteRepo.create({ userId, companyId, noteDate, text });
  }

  async update(id, userId, text) {
    return personalNoteRepo.update(id, userId, { text });
  }

  async delete(id, userId) {
    return personalNoteRepo.delete(id, userId);
  }
}

module.exports = new PersonalNoteService();
