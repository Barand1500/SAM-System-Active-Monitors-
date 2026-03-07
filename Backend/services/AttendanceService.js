const attendanceRepo = require("../repositories/AttendanceRepository");
const { User, Attendance } = require("../models");
const { today } = require("../utils/dateUtils");

class AttendanceService {
  async checkIn(user_id, { ip_address, device } = {}) {
    const date = today();
    let attendance = await attendanceRepo.findByUserAndDate(user_id, date);

    if (attendance && attendance.checkIn) {
      throw new Error("Already checked in");
    }

    if (!attendance) {
      attendance = await attendanceRepo.create({
        user_id,
        date,
        check_in: new Date(),
        ip_address: ip_address || null,
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
      throw new Error("Check-in not found");
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
}

module.exports = new AttendanceService();
