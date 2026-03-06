class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    const instance = await this.model.findByPk(id);
    if (!instance) throw new Error(`${this.model.name} not found`);
    return instance.update(data);
  }

  async delete(id) {
    const instance = await this.model.findByPk(id);
    if (!instance) throw new Error(`${this.model.name} not found`);
    return instance.destroy();
  }
}

module.exports = BaseRepository;