// Backend/controllers/CompanySettingController.js
const CompanySettingRepo = require("../repositories/CompanySettingRepository");

class CompanySettingController {
  async get(req, res) {
    try {
      const settings = await CompanySettingRepo.getByCompany(req.user.company_id);
      res.json(settings);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const settings = await CompanySettingRepo.getByCompany(req.user.company_id);
      if (!settings) return res.status(404).json({ error: "Not found" });
      Object.assign(settings, req.body);
      await settings.save();
      res.json(settings);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new CompanySettingController();