// Backend/repositories/BreakRepository.js
const BaseRepository = require("./BaseRepository");
const { Break } = require("../models");

class BreakRepository extends BaseRepository {
  constructor() {
    super(Break);
  }

  async findByAttendance(attendance_id) {
    return this.model.findAll({ where: { attendanceId: attendance_id } });
  }
}

module.exports = new BreakRepository();