const BaseRepository = require("./BaseRepository");
const { AuditLog } = require("../models");

class AuditLogRepository extends BaseRepository {
  constructor() {
    super(AuditLog);
  }

  async findByCompany(companyId, { type, userId, limit = 500, offset = 0 } = {}) {
    const where = { companyId };
    if (type && type !== "all") where.type = type;
    if (userId && userId !== "all") where.userId = userId;

    return AuditLog.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });
  }

  async deleteByCompany(companyId) {
    return AuditLog.destroy({ where: { companyId } });
  }
}

module.exports = new AuditLogRepository();
