const leaveRepo = require("../repositories/LeaveRepository");

class LeaveService {
  async create(data) {
    return leaveRepo.create(data);
  }

  async getByUser(user_id) {
    return leaveRepo.findByUser(user_id);
  }

  async getById(id) {
    return leaveRepo.findById(id);
  }

  async getPendingByCompany(companyId) {
    return leaveRepo.findPendingByCompany(companyId);
  }

  async approve(id, approvedBy) {
    const leave = await leaveRepo.findById(id);
    if (!leave) throw new Error("Leave request not found");
    leave.approvalStatus = "approved";
    leave.approvedBy = approvedBy;
    leave.approvedAt = new Date();
    await leave.save();
    return leave;
  }

  async reject(id, approvedBy, rejectionReason) {
    const leave = await leaveRepo.findById(id);
    if (!leave) throw new Error("Leave request not found");
    leave.approvalStatus = "rejected";
    leave.approvedBy = approvedBy;
    leave.approvedAt = new Date();
    leave.rejectionReason = rejectionReason;
    await leave.save();
    return leave;
  }
}

module.exports = new LeaveService();
