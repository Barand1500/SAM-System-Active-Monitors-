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

  async getWeeklyTaskTrend(company_id) {
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const results = [];
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(monday);
      dayStart.setDate(monday.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const [completed] = await sequelize.query(
        `SELECT COUNT(*) as count FROM tasks 
         WHERE company_id = :company_id AND status_id IN (
           SELECT id FROM task_statuses WHERE company_id = :company_id AND LOWER(name) LIKE '%tamamlan%'
         ) AND updated_at BETWEEN :start AND :end`,
        { replacements: { company_id, start: dayStart, end: dayEnd }, type: QueryTypes.SELECT }
      );
      const [created] = await sequelize.query(
        `SELECT COUNT(*) as count FROM tasks 
         WHERE company_id = :company_id AND created_at BETWEEN :start AND :end`,
        { replacements: { company_id, start: dayStart, end: dayEnd }, type: QueryTypes.SELECT }
      );

      const dayIndex = dayStart.getDay();
      results.push({
        day: days[dayIndex],
        completed: parseInt(completed?.count || 0),
        created: parseInt(created?.count || 0)
      });
    }
    return results;
  }

  async getTaskTrends(company_id) {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    thisWeekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setMilliseconds(-1);

    const [thisWeekTasks] = await sequelize.query(
      `SELECT COUNT(*) as count FROM tasks WHERE company_id = :company_id AND created_at >= :start`,
      { replacements: { company_id, start: thisWeekStart }, type: QueryTypes.SELECT }
    );
    const [lastWeekTasks] = await sequelize.query(
      `SELECT COUNT(*) as count FROM tasks WHERE company_id = :company_id AND created_at BETWEEN :start AND :end`,
      { replacements: { company_id, start: lastWeekStart, end: lastWeekEnd }, type: QueryTypes.SELECT }
    );

    const [thisWeekCompleted] = await sequelize.query(
      `SELECT COUNT(*) as count FROM tasks WHERE company_id = :company_id AND status_id IN (
        SELECT id FROM task_statuses WHERE company_id = :company_id AND LOWER(name) LIKE '%tamamlan%'
      ) AND updated_at >= :start`,
      { replacements: { company_id, start: thisWeekStart }, type: QueryTypes.SELECT }
    );
    const [lastWeekCompleted] = await sequelize.query(
      `SELECT COUNT(*) as count FROM tasks WHERE company_id = :company_id AND status_id IN (
        SELECT id FROM task_statuses WHERE company_id = :company_id AND LOWER(name) LIKE '%tamamlan%'
      ) AND updated_at BETWEEN :start AND :end`,
      { replacements: { company_id, start: lastWeekStart, end: lastWeekEnd }, type: QueryTypes.SELECT }
    );

    const calcTrend = (current, previous) => {
      const c = parseInt(current?.count || 0);
      const p = parseInt(previous?.count || 0);
      if (p === 0) return c > 0 ? '+100%' : '0%';
      const diff = Math.round(((c - p) / p) * 100);
      return diff >= 0 ? `+${diff}%` : `${diff}%`;
    };

    return {
      totalTrend: calcTrend(thisWeekTasks, lastWeekTasks),
      completedTrend: calcTrend(thisWeekCompleted, lastWeekCompleted)
    };
  }
}

module.exports = new ReportRepository();
