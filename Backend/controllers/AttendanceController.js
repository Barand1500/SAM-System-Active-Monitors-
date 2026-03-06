// Backend/controllers/AttendanceController.js
const AttendanceRepo = require("../repositories/AttendanceRepository");

class AttendanceController {
  async checkIn(req, res) {
    try {
      const date = new Date().toISOString().split("T")[0];
      let attendance = await AttendanceRepo.findByUserAndDate(req.user.id, date);

      if (attendance && attendance.check_in) {
        return res.status(400).json({ error: "Already checked in" });
      }

      if (!attendance) {
        attendance = await AttendanceRepo.create({
          user_id: req.user.id,
          date,
          check_in: new Date(),
        });
      } else {
        attendance.check_in = new Date();
        await attendance.save();
      }

      res.json(attendance);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async checkOut(req, res) {
    try {
      const date = new Date().toISOString().split("T")[0];
      const attendance = await AttendanceRepo.findByUserAndDate(req.user.id, date);

      if (!attendance || !attendance.check_in) {
        return res.status(400).json({ error: "Check-in not found" });
      }

      attendance.check_out = new Date();
      await attendance.save();
      res.json(attendance);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AttendanceController();