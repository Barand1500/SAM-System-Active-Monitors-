const { sequelize } = require("../models");
const { QueryTypes } = require("sequelize");

class ReportRepository {
  async getTaskCountsByStatus(company_id) {
    return sequelize.query(
      `SELECT ts.name as status, COUNT(t.id) as count
       FROM tasks t
       JOIN task_statuses ts ON t.status_id = ts.id
       WHERE t.company_id = :company_id
       GROUP BY ts.name`,
      { replacements: { company_id }, type: QueryTypes.SELECT }
    );
  }

  async getAttendanceSummary(company_id, startDate, endDate) {
    return sequelize.query(
      `SELECT u.first_name, u.last_name, COUNT(a.id) as total_days
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       WHERE u.company_id = :company_id
       AND a.date BETWEEN :startDate AND :endDate
       GROUP BY u.id`,
      { replacements: { company_id, startDate, endDate }, type: QueryTypes.SELECT }
    );
  }

  async getLeaveRequestCounts(company_id) {
    return sequelize.query(
      `SELECT lr.approval_status, COUNT(lr.id) as count
       FROM leave_requests lr
       JOIN users u ON lr.user_id = u.id
       WHERE u.company_id = :company_id
       GROUP BY lr.approval_status`,
      { replacements: { company_id }, type: QueryTypes.SELECT }
    );
  }
}

module.exports = new ReportRepository();
