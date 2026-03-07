// Backend/controllers/BreakController.js
const BreakService = require("../services/BreakService");

class BreakController {
  async startBreak(req, res) {
    try {
      const br = await BreakService.startBreak(req.user.id, req.body.break_type_id);
      res.status(201).json(br);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async endBreak(req, res) {
    try {
      const br = await BreakService.endBreak(req.user.id, req.params.breakId);
      res.json(br);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new BreakController();