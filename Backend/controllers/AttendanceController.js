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
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const attendances = await AttendanceService.listByCompany(
        companyId,
        req.query.date
      );
      res.json(attendances || []);
    } catch (err) {
      console.error('[AttendanceController] list error:', err.message);
      res.status(500).json({ error: "Failed to fetch attendance records" });
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