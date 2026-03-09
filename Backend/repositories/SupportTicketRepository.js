const BaseRepository = require("./BaseRepository");
const { SupportTicket, TicketMessage, TicketFile, TicketCategory, User } = require("../models");

class SupportTicketRepository extends BaseRepository {
  constructor() {
    super(SupportTicket);
  }

  async findByCompany(company_id, filters = {}) {
    const where = { company_id, ...filters };
    return this.model.findAll({
      where,
      include: [
        {
          model: TicketMessage,
          include: [User, TicketFile]
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name", "email"]
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "first_name", "last_name", "email"]
        }
      ],
      order: [["created_at", "DESC"]]
    });
  }

  async findWithMessages(id) {
    return this.model.findByPk(id, {
      include: [
        {
          model: TicketMessage,
          include: [
            {
              model: User,
              attributes: ["id", "first_name", "last_name", "email", "avatar_url"]
            },
            TicketFile
          ],
          order: [["created_at", "ASC"]]
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "first_name", "last_name", "email"]
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "first_name", "last_name", "email"]
        }
      ]
    });
  }

  async getStats(company_id) {
    const open = await this.model.count({ where: { company_id, status: "open" } });
    const inProgress = await this.model.count({ where: { company_id, status: "in_progress" } });
    const resolved = await this.model.count({ where: { company_id, status: "resolved" } });

    return { open, inProgress, resolved };
  }

  async getByStatus(company_id, status) {
    return this.model.findAll({
      where: { company_id, status },
      order: [["created_at", "DESC"]]
    });
  }
}

module.exports = new SupportTicketRepository();
