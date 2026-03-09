// Backend/repositories/LeaveRepository.js
const BaseRepository = require("./BaseRepository");
const { LeaveRequest, User } = require("../models");

class LeaveRepository extends BaseRepository {
  constructor() {
    super(LeaveRequest);
  }

  async findByUser(user_id) {
    return this.model.findAll({ where: { userId: user_id } });
  }

  async findPendingByCompany(companyId) {
    return this.model.findAll({
      where: { approvalStatus: "pending" },
      include: [{
        model: User,
        where: { companyId },

        attributes: ["id", "first_name", "last_name", "email"]
      }],
      order: [["created_at", "ASC"]]
    });
  }
}

module.exports = new LeaveRepository();