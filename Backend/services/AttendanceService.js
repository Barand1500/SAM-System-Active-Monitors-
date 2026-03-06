const attendanceRepo = require("../repositories/AttendanceRepository");

class AttendanceService {
  async checkIn(user_id) {
    const date = new Date().toISOString().split("T")[0];
    let attendance = await attendanceRepo.findByUserAndDate(user_id, date);

    if (attendance && attendance.check_in) {
      throw new Error("Already checked in");
    }

    if (!attendance) {
      attendance = await attendanceRepo.create({
        user_id,
        date,
        check_in: new Date()
      });
    } else {
      attendance.check_in = new Date();
      await attendance.save();
    }
    return attendance;
  }

  async checkOut(user_id) {
    const date = new Date().toISOString().split("T")[0];
    const attendance = await attendanceRepo.findByUserAndDate(user_id, date);

    if (!attendance || !attendance.check_in) {
      throw new Error("Check-in not found");
    }

    attendance.check_out = new Date();
    await attendance.save();
    return attendance;
  }

  async getByUserAndDate(user_id, date) {
    return attendanceRepo.findByUserAndDate(user_id, date);
  }
}

module.exports = new AttendanceService();
