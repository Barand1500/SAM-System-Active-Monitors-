const { PersonalNote } = require("../models");

class PersonalNoteRepository {
  async findByUser(userId, companyId) {
    return PersonalNote.findAll({
      where: { userId, companyId },
      order: [["note_date", "ASC"], ["created_at", "ASC"]],
    });
  }

  async create(data) {
    return PersonalNote.create(data);
  }

  async update(id, userId, data) {
    const note = await PersonalNote.findOne({ where: { id, userId } });
    if (!note) throw new Error("Not bulunamadı");
    return note.update(data);
  }

  async delete(id, userId) {
    const note = await PersonalNote.findOne({ where: { id, userId } });
    if (!note) throw new Error("Not bulunamadı");
    return note.destroy();
  }
}

module.exports = new PersonalNoteRepository();
