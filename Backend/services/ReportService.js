const reportRepo = require("../repositories/ReportRepository");

class ReportService {
  async getTaskReport(company_id) {
    return reportRepo.getTaskCountsByStatus(company_id);
  }

  async getAttendanceReport(company_id, startDate, endDate) {
    return reportRepo.getAttendanceSummary(company_id, startDate, endDate);
  }

  async getLeaveReport(company_id) {
    return reportRepo.getLeaveRequestCounts(company_id);
  }

  async getWeeklyTrend(company_id) {
    return reportRepo.getWeeklyTaskTrend(company_id);
  }

  async getTaskTrends(company_id) {
    return reportRepo.getTaskTrends(company_id);
  }
}

module.exports = new ReportService();
