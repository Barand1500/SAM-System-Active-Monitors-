const BaseRepository = require("./BaseRepository");
const { TaskPriority } = require("../models");

class TaskPriorityRepository extends BaseRepository {
  constructor() {
    super(TaskPriority);
  }

  async findByCompany(company_id) {
    return this.model.findAll({
      where: { company_id },
      order: [["order_no", "ASC"]]
    });
  }
}

module.exports = new TaskPriorityRepository();
