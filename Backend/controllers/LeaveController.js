// Backend/controllers/LeaveController.js
const LeaveRepo = require("../repositories/LeaveRepository");

class LeaveController {
  async createLeave(req, res) {
    try {
      const leave = await LeaveRepo.create({
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
      const leaves = await LeaveRepo.findByUser(req.user.id);
      res.json(leaves);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new LeaveController();