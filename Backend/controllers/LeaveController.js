// Backend/controllers/LeaveController.js
const LeaveService = require("../services/LeaveService");
const AuditLogService = require("../services/AuditLogService");

const logAudit = async (req, type, action, description, recordId, oldValue, newValue) => {
  try {
    await AuditLogService.create({
      companyId: req.user?.company_id || req.user?.companyId,
      userId: req.user?.id,
      userName: `${req.user?.firstName || req.user?.first_name || ''} ${req.user?.lastName || req.user?.last_name || ''}`.trim(),
      type, action, description, entity: 'LeaveRequest', tableName: 'leave_requests', recordId,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      ipAddress: req.ip
    });
  } catch (e) { /* audit hatası ana işlemi engellemesin */ }
};

class LeaveController {
  async createLeave(req, res) {
    try {
      const { leaveType, startDate, endDate, leaveDays, reasonText, documentUrl } = req.body;
      const leave = await LeaveService.create({
        userId: req.user.id,
        leaveType,
        startDate,
        endDate,
        leaveDays,
        reasonText,
        documentUrl,
      });
      await logAudit(req, 'leave_created', 'CREATE', `İzin talebi oluşturuldu: ${leaveType} (${startDate} - ${endDate})`, leave.id, null, leave);
      res.status(201).json(leave);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getMyLeaves(req, res) {
    try {
      const leaves = await LeaveService.getByUser(req.user.id);
      res.json(leaves);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getPendingLeaves(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const leaves = await LeaveService.getPendingByCompany(companyId);
      res.json(leaves || []);
    } catch (err) {
      console.error('[LeaveController] getPendingLeaves error:', err.message);
      res.status(500).json({ error: "Failed to fetch pending leaves" });
    }
  }

  async getAllLeaves(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const leaves = await LeaveService.getAllByCompany(companyId);
      res.json(leaves || []);
    } catch (err) {
      console.error('[LeaveController] getAllLeaves error:', err.message);
      res.status(500).json({ error: "Failed to fetch leaves" });
    }
  }

  async approveLeave(req, res) {
    try {
      const leave = await LeaveService.approve(req.params.id, req.user.id);
      await logAudit(req, 'leave_approved', 'UPDATE', `İzin talebi onaylandı #${req.params.id}`, req.params.id, { status: 'pending' }, { status: 'approved' });
      res.json(leave);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async rejectLeave(req, res) {
    try {
      const leave = await LeaveService.reject(req.params.id, req.user.id, req.body.rejection_reason);
      await logAudit(req, 'leave_rejected', 'UPDATE', `İzin talebi reddedildi #${req.params.id}: ${req.body.rejection_reason || ''}`, req.params.id, { status: 'pending' }, { status: 'rejected', reason: req.body.rejection_reason });
      res.json(leave);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new LeaveController();