// Backend/repositories/CompanySettingRepository.js
const BaseRepository = require("./BaseRepository");
const { CompanySetting } = require("../models");

class CompanySettingRepository extends BaseRepository {
  constructor() {
    super(CompanySetting);
  }

  async getByCompany(company_id) {
    return this.model.findOne({ where: { company_id } });
  }
}

module.exports = new CompanySettingRepository();