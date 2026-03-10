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
      const { company_id, id, profileData, ...safeData } = req.body;
      const settings = await CompanySettingService.upsert(req.user.company_id, safeData);
      res.json(settings);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async getProfile(req, res) {
    try {
      const settings = await CompanySettingService.getByCompany(req.user.company_id);
      res.json(settings?.profileData || null);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const profileData = req.body;
      const settings = await CompanySettingService.upsert(req.user.company_id, { profileData });
      res.json(settings.profileData);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new CompanySettingController();