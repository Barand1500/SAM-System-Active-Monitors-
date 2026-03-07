const companySettingRepo = require("../repositories/CompanySettingRepository");
const { CompanySetting } = require("../models");

class CompanySettingService {
  async getByCompany(company_id) {
    return companySettingRepo.getByCompany(company_id);
  }

  async upsert(company_id, data) {
    let settings = await companySettingRepo.getByCompany(company_id);
    if (!settings) {
      settings = await CompanySetting.create({ ...data, company_id });
    } else {
      await settings.update(data);
    }
    return settings;
  }
}

module.exports = new CompanySettingService();
