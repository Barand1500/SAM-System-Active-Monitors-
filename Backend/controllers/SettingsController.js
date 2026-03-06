const { CompanySetting } = require("../models");

class SettingsController {
  async get(req, res) {
    try {
      const settings = await CompanySetting.findOne({ where: { company_id: req.user.company_id } });
      res.json(settings);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      let settings = await CompanySetting.findOne({ where: { company_id: req.user.company_id } });
      if (!settings) {
        settings = await CompanySetting.create({ ...req.body, company_id: req.user.company_id });
      } else {
        await settings.update(req.body);
      }
      res.json(settings);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new SettingsController();
