class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async findById(id, companyId = null, options = {}) {
    const where = { id };
    if (companyId) where.company_id = companyId;
    return this.model.findOne({ where, ...options });
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data, companyId = null) {
    const where = { id };
    if (companyId) where.company_id = companyId;
    const instance = await this.model.findOne({ where });
    if (!instance) throw new Error(`${this.model.name} not found`);
    return instance.update(data);
  }

  async delete(id, companyId = null) {
    const where = { id };
    if (companyId) where.company_id = companyId;
    const instance = await this.model.findOne({ where });
    if (!instance) throw new Error(`${this.model.name} not found`);
    return instance.destroy();
  }
}

module.exports = BaseRepository;