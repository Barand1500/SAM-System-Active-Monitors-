// Backend/controllers/LeaveController.js
const LeaveService = require("../services/LeaveService");

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

  async approveLeave(req, res) {
    try {
      const leave = await LeaveService.approve(req.params.id, req.user.id);
      res.json(leave);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async rejectLeave(req, res) {
    try {
      const leave = await LeaveService.reject(req.params.id, req.user.id, req.body.rejection_reason);
      res.json(leave);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new LeaveController();