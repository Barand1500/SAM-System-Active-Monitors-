// Backend/controllers/CompanySettingController.js
const CompanySettingService = require("../services/CompanySettingService");

class CompanySettingController {
  async get(req, res) {
    try {
      const settings = await CompanySettingService.getByCompany(req.user.company_id);
      res.json(settings);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const { company_id, id, ...safeData } = req.body;
      const settings = await CompanySettingService.upsert(req.user.company_id, safeData);
      res.json(settings);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new CompanySettingController();