// Backend/repositories/AttendanceRepository.js
const BaseRepository = require("./BaseRepository");
const { Attendance } = require("../models");

class AttendanceRepository extends BaseRepository {
  constructor() {
    super(Attendance);
  }

  async findByUserAndDate(user_id, date) {
    return this.model.findOne({ where: { user_id, date } });
  }
}

module.exports = new AttendanceRepository();