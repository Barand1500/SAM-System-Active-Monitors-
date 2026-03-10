const auditLogRepo = require("../repositories/AuditLogRepository");

class AuditLogService {
  async list(companyId, filters = {}) {
    return auditLogRepo.findByCompany(companyId, filters);
  }

  async create(data) {
    return auditLogRepo.create(data);
  }

  async clearByCompany(companyId) {
    return auditLogRepo.deleteByCompany(companyId);
  }
}

module.exports = new AuditLogService();
