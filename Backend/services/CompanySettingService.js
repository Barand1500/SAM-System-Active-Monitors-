const companySettingRepo = require("../repositories/CompanySettingRepository");
const { CompanySetting } = require("../models");

class CompanySettingService {
  async getByCompany(company_id) {
    try {
      console.log('[CompanySettingService.getByCompany] Querying for company_id:', company_id);
      const result = await companySettingRepo.getByCompany(company_id);
      console.log('[CompanySettingService.getByCompany] Query result:', result);
      return result;
    } catch (err) {
      console.error('[CompanySettingService.getByCompany] Database error:', {
        message: err.message,
        stack: err.stack,
        company_id
      });
      throw err;
    }
  }

  async upsert(company_id, data) {
    try {
      console.log('[CompanySettingService.upsert] Upserting for company_id:', company_id, 'with data:', data);
      let settings = await companySettingRepo.getByCompany(company_id);
      if (!settings) {
        console.log('[CompanySettingService.upsert] No existing settings, creating new');
        settings = await CompanySetting.create({ ...data, company_id });
      } else {
        console.log('[CompanySettingService.upsert] Updating existing settings');
        await settings.update(data);
      }
      return settings;
    } catch (err) {
      console.error('[CompanySettingService.upsert] Error:', {
        message: err.message,
        stack: err.stack,
        company_id,
        data
      });
      throw err;
    }
  }
}

module.exports = new CompanySettingService();
