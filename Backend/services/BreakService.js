const breakRepo = require("../repositories/BreakRepository");
const attendanceRepo = require("../repositories/AttendanceRepository");
const { BreakType } = require("../models");
const { today, diffInMinutes } = require("../utils/dateUtils");

class BreakService {
  async startBreak(user_id, break_type_id) {
    const attendance = await attendanceRepo.findByUserAndDate(user_id, today());
    if (!attendance || attendance.checkOut) {
      throw new Error("No active attendance found");
    }

    return breakRepo.create({
      attendanceId: attendance.id,
      breakTypeId: break_type_id || null,
      startTime: new Date(),
    });
  }

  async endBreak(user_id, breakId) {
    const attendance = await attendanceRepo.findByUserAndDate(user_id, today());
    if (!attendance) {
      throw new Error("No active attendance found");
    }

    const br = await breakRepo.model.findOne({
      where: { id: breakId, attendanceId: attendance.id },
    });
    if (!br) throw new Error("Break not found");

    br.endTime = new Date();

    if (br.breakTypeId) {
      const breakType = await BreakType.findByPk(br.breakTypeId);
      if (breakType && breakType.maxDuration) {
        const durationMin = diffInMinutes(br.startTime, br.endTime);
        br.isViolated = durationMin > breakType.maxDuration;
      }
    }

    await br.save();
    return br;
  }

  async getByAttendance(attendance_id) {
    return breakRepo.findByAttendance(attendance_id);
  }
}

module.exports = new BreakService();
