// Backend/controllers/BreakController.js
const BreakRepo = require("../repositories/BreakRepository");

class BreakController {
  async startBreak(req, res) {
    try {
      const br = await BreakRepo.create({
        attendance_id: req.body.attendance_id,
        break_type_id: req.body.break_type_id,
        start_time: new Date(),
      });
      res.status(201).json(br);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async endBreak(req, res) {
    try {
      const br = await BreakRepo.model.findByPk(req.params.breakId);
      if (!br) return res.status(404).json({ error: "Break not found" });

      br.end_time = new Date();
      await br.save();
      res.json(br);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new BreakController();