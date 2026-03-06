// Backend/repositories/LeaveRepository.js
const BaseRepository = require("./BaseRepository");
const { LeaveRequest } = require("../models");

class LeaveRepository extends BaseRepository {
  constructor() {
    super(LeaveRequest);
  }

  async findByUser(user_id) {
    return this.model.findAll({ where: { user_id } });
  }
}

module.exports = new LeaveRepository();