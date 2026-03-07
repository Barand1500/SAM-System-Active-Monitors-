const { Task, User, Attendance, LeaveRequest, Announcement } = require("../models");
const { Op } = require("sequelize");

class DashboardController {
  async getSummary(req, res) {
    try {
      const company_id = req.user.company_id;
      const today = new Date().toISOString().split("T")[0];

      const [totalUsers, totalTasks, todayAttendance, pendingLeaves, announcements] = await Promise.all([
        User.count({ where: { company_id, status: "active" } }),
        Task.count({ where: { company_id } }),
        Attendance.count({
          where: { date: today },
          include: [{ model: User, where: { company_id }, attributes: [] }]
        }),
        LeaveRequest.count({
          where: { approval_status: "pending" },
          include: [{ model: User, where: { company_id }, attributes: [] }]
        }),
        Announcement.findAll({
          where: { company_id },
          order: [["created_at", "DESC"]],
          limit: 5
        })
      ]);

      res.json({
        totalUsers,
        totalTasks,
        todayAttendance,
        pendingLeaves,
        announcements
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new DashboardController();
