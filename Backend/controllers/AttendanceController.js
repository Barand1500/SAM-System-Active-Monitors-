// Backend/controllers/AttendanceController.js
const AttendanceService = require("../services/AttendanceService");

class AttendanceController {
  async checkIn(req, res) {
    try {
      const attendance = await AttendanceService.checkIn(req.user.id, {
        ip_address: req.ip,
        device: req.headers["user-agent"] || null,
      });
      res.json(attendance);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async checkOut(req, res) {
    try {
      const attendance = await AttendanceService.checkOut(req.user.id);
      res.json(attendance);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const attendances = await AttendanceService.listByCompany(
        req.user.company_id,
        req.query.date
      );
      res.json(attendances);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async myWeekly(req, res) {
    try {
      const logs = await AttendanceService.getUserWeeklyLogs(req.user.id);
      res.json(logs);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AttendanceController();