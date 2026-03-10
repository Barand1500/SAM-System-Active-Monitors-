const BaseRepository = require("./BaseRepository");
const { SupportTicket, TicketMessage, TicketFile, TicketCategory, User } = require("../models");

class SupportTicketRepository extends BaseRepository {
  constructor() {
    super(SupportTicket);
  }

  async findByCompany(companyId, filters = {}) {
    const where = { companyId, ...filters };
    return this.model.findAll({
      where,
      include: [
        {
          model: TicketMessage,
          include: [
            {
              model: User,
              attributes: ["id", "firstName", "lastName", "email"]
            },
            TicketFile
          ]
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email"]
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "firstName", "lastName", "email"]
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
              attributes: ["id", "firstName", "lastName", "email", "avatarUrl"]
            },
            TicketFile
          ]
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "firstName", "lastName", "email"]
        },
        {
          model: User,
          as: "assignee",
          attributes: ["id", "firstName", "lastName", "email"]
        }
      ]
    });
  }

  async getStats(companyId) {
    const open = await this.model.count({ where: { companyId, status: "open" } });
    const inProgress = await this.model.count({ where: { companyId, status: "in_progress" } });
    const resolved = await this.model.count({ where: { companyId, status: "resolved" } });

    return { open, inProgress, resolved };
  }

  async getByStatus(companyId, status) {
    return this.model.findAll({
      where: { companyId, status },
      order: [["created_at", "DESC"]]
    });
  }
}

module.exports = new SupportTicketRepository();
