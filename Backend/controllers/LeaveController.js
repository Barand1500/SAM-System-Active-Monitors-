// Backend/controllers/LeaveController.js
const LeaveService = require("../services/LeaveService");

class LeaveController {
  async createLeave(req, res) {
    try {
      const leave = await LeaveService.create({
        ...req.body,
        user_id: req.user.id,
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
      const leaves = await LeaveService.getPendingByCompany(req.user.company_id);
      res.json(leaves);
    } catch (err) {
      res.status(400).json({ error: err.message });
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