const { Contact } = require("../models");
const ContactRepository = require("../repositories/ContactRepository");

const repo = new ContactRepository(Contact);

class ContactService {
  async list(companyId) {
    return repo.findByCompany(companyId);
  }

  async create(data) {
    return repo.create(data);
  }

  async update(id, companyId, data) {
    const contact = await repo.model.findOne({ where: { id, company_id: companyId } });
    if (!contact) throw new Error("Kişi bulunamadı");
    return contact.update(data);
  }

  async delete(id, companyId) {
    const contact = await repo.model.findOne({ where: { id, company_id: companyId } });
    if (!contact) throw new Error("Kişi bulunamadı");
    return contact.destroy();
  }
}

module.exports = new ContactService();
