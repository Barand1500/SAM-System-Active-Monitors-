const ReportService = require("../services/ReportService");

class ReportController {
  async taskReport(req, res) {
    try {
      const data = await ReportService.getTaskReport(req.user.company_id);
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async attendanceReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const data = await ReportService.getAttendanceReport(req.user.company_id, startDate, endDate);
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async leaveReport(req, res) {
    try {
      const data = await ReportService.getLeaveReport(req.user.company_id);
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async weeklyTrend(req, res) {
    try {
      const data = await ReportService.getWeeklyTrend(req.user.company_id);
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async taskTrends(req, res) {
    try {
      const data = await ReportService.getTaskTrends(req.user.company_id);
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new ReportController();
