const contactService = require("../services/ContactService");

class ContactController {
  async list(req, res) {
    try {
      const contacts = await contactService.list(req.user.company_id);
      res.json(contacts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async create(req, res) {
    try {
      const { name, phone, company, addresses } = req.body;
      if (!name) return res.status(400).json({ message: "İsim zorunludur" });
      const contact = await contactService.create({
        companyId: req.user.company_id,
        name,
        phone: phone || null,
        company: company || null,
        addresses: addresses || [],
      });
      res.status(201).json(contact);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async update(req, res) {
    try {
      const contact = await contactService.update(req.params.id, req.user.company_id, req.body);
      res.json(contact);
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  }

  async delete(req, res) {
    try {
      await contactService.delete(req.params.id, req.user.company_id);
      res.json({ message: "Kişi silindi" });
    } catch (err) {
      res.status(404).json({ message: err.message });
    }
  }
}

module.exports = new ContactController();
