const BaseRepository = require("./BaseRepository");
const { TaskStatus } = require("../models");

class TaskStatusRepository extends BaseRepository {
  constructor() {
    super(TaskStatus);
  }

  async findByCompany(company_id) {
    return this.model.findAll({
      where: { company_id },
      order: [["order_no", "ASC"]]
    });
  }
}

module.exports = new TaskStatusRepository();
