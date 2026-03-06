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

  async approve(id, approvedBy) {
    const leave = await leaveRepo.findById(id);
    if (!leave) throw new Error("Leave request not found");
    leave.approval_status = "approved";
    leave.approved_by = approvedBy;
    leave.approved_at = new Date();
    await leave.save();
    return leave;
  }

  async reject(id, approvedBy, rejectionReason) {
    const leave = await leaveRepo.findById(id);
    if (!leave) throw new Error("Leave request not found");
    leave.approval_status = "rejected";
    leave.approved_by = approvedBy;
    leave.approved_at = new Date();
    leave.rejection_reason = rejectionReason;
    await leave.save();
    return leave;
  }
}

module.exports = new LeaveService();
