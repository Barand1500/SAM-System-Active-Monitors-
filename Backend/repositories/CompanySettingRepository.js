// Backend/repositories/CompanySettingRepository.js
const BaseRepository = require("./BaseRepository");
const { CompanySetting } = require("../models");

class CompanySettingRepository extends BaseRepository {
  constructor() {
    super(CompanySetting);
  }

  async getByCompany(company_id) {
    try {
      console.log('[CompanySettingRepository.getByCompany] Querying with company_id:', company_id, 'type:', typeof company_id);
      if (!company_id) {
        console.error('[CompanySettingRepository.getByCompany] company_id is null/undefined');
        throw new Error('company_id is required');
      }
      
      const result = await this.model.findOne({ where: { companyId: company_id } });
      console.log('[CompanySettingRepository.getByCompany] Found:', result ? 'YES' : 'NO');
      return result;
    } catch (err) {
      console.error('[CompanySettingRepository.getByCompany] Database error:', {
        message: err.message,
        stack: err.stack
      });
      throw err;
    }
  }
}

module.exports = new CompanySettingRepository();