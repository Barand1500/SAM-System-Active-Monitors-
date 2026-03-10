const { UserDashboardSetting } = require("../models");

class DashboardSettingController {
  async get(req, res) {
    try {
      let setting = await UserDashboardSetting.findOne({ where: { user_id: req.user.id } });
      res.json(setting?.layout || null);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async update(req, res) {
    try {
      const layout = req.body;
      let setting = await UserDashboardSetting.findOne({ where: { user_id: req.user.id } });
      if (setting) {
        await setting.update({ layout });
      } else {
        setting = await UserDashboardSetting.create({ userId: req.user.id, layout });
      }
      res.json(setting.layout);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new DashboardSettingController();
