const attendanceRepo = require("../repositories/AttendanceRepository");
const { User, Attendance } = require("../models");
const { today } = require("../utils/dateUtils");

class AttendanceService {
  async checkIn(user_id, { ip_address, device } = {}) {
    const date = today();
    let attendance = await attendanceRepo.findByUserAndDate(user_id, date);

    if (attendance && attendance.checkIn) {
      // Zaten check-in yapılmış, mevcut kaydı dön
      return attendance;
    }

    if (!attendance) {
      attendance = await attendanceRepo.create({
        userId: user_id,
        date,
        checkIn: new Date(),
        ipAddress: ip_address || null,
        device: device || null,
      });
    } else {
      attendance.checkIn = new Date();
      await attendance.save();
    }
    return attendance;
  }

  async checkOut(user_id) {
    const date = today();
    const attendance = await attendanceRepo.findByUserAndDate(user_id, date);

    if (!attendance || !attendance.checkIn) {
      throw new Error("Giriş kaydı bulunamadı");
    }

    attendance.checkOut = new Date();
    await attendance.save();
    return attendance;
  }

  async listByCompany(company_id, date) {
    const where = {};
    if (date) where.date = date;

    return Attendance.findAll({
      where,
      include: [{
        model: User,
        attributes: ["id", "first_name", "last_name", "email"],
        where: { company_id },
      }],
      order: [["date", "DESC"], ["check_in", "DESC"]],
    });
  }

  async getByUserAndDate(user_id, date) {
    return attendanceRepo.findByUserAndDate(user_id, date);
  }

  async getUserWeeklyLogs(user_id) {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const { Op } = require('sequelize');
    const { Break } = require('../models');

    const records = await Attendance.findAll({
      where: {
        userId: user_id,
        date: { [Op.gte]: monday.toISOString().split('T')[0] }
      },
      order: [['date', 'DESC']]
    });

    const logs = [];
    for (const r of records) {
      const breaks = await Break.findAll({ where: { attendanceId: r.id } });
      const breakMinutes = breaks.reduce((sum, b) => {
        if (b.startTime && b.endTime) {
          return sum + Math.floor((new Date(b.endTime) - new Date(b.startTime)) / 60000);
        }
        return sum;
      }, 0);

      const checkIn = r.checkIn ? new Date(r.checkIn) : null;
      const checkOut = r.checkOut ? new Date(r.checkOut) : null;
      const totalHours = (checkIn && checkOut)
        ? +((checkOut - checkIn) / 3600000 - breakMinutes / 60).toFixed(2)
        : 0;

      logs.push({
        date: r.date,
        checkIn: checkIn ? checkIn.toTimeString().slice(0, 5) : null,
        checkOut: checkOut ? checkOut.toTimeString().slice(0, 5) : null,
        breakMinutes,
        totalHours: Math.max(0, totalHours)
      });
    }
    return logs;
  }
}

module.exports = new AttendanceService();
