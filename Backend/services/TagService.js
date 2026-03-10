const tagRepo = require("../repositories/TagRepository");

class TagService {
  async list(companyId) {
    return tagRepo.findByCompany(companyId);
  }

  async create(data) {
    return tagRepo.create(data);
  }

  async update(id, companyId, data) {
    const tag = await tagRepo.model.findOne({ where: { id, company_id: companyId } });
    if (!tag) throw new Error("Etiket bulunamadı");
    return tag.update(data);
  }

  async delete(id, companyId) {
    const tag = await tagRepo.model.findOne({ where: { id, company_id: companyId } });
    if (!tag) throw new Error("Etiket bulunamadı");
    return tag.destroy();
  }
}

module.exports = new TagService();
