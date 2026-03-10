const BaseRepository = require("./BaseRepository");
const { Customer, User } = require("../models");

class CustomerRepository extends BaseRepository {
  constructor() {
    super(Customer);
  }

  async findByCompany(companyId, filters = {}) {
    const where = { companyId };
    if (filters.type) where.type = filters.type;
    if (filters.sector) where.sector = filters.sector;

    return this.model.findAll({
      where,
      include: [
        {
          model: Customer,
          as: "parent",
          attributes: ["id", "contactName", "companyName", "type"]
        },
        {
          model: Customer,
          as: "children",
          attributes: ["id", "contactName", "companyName", "type"]
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName"]
        }
      ],
      order: [["created_at", "DESC"]]
    });
  }

  async findOneByCompany(id, companyId) {
    return this.model.findOne({
      where: { id, companyId },
      include: [
        {
          model: Customer,
          as: "parent",
          attributes: ["id", "contactName", "companyName", "type"]
        },
        {
          model: Customer,
          as: "children",
          attributes: ["id", "contactName", "companyName", "type"]
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName"]
        }
      ]
    });
  }

  async deleteByCompany(id, companyId) {
    // Alt müşterilerin parentId'sini null yap
    await this.model.update({ parentId: null }, { where: { parentId: id, companyId } });
    const instance = await this.model.findOne({ where: { id, companyId } });
    if (!instance) throw new Error("Customer not found");
    return instance.destroy();
  }
}

module.exports = new CustomerRepository();
