const { UserDashboardSetting } = require("../models");
const logger = require("../utils/logger");

class DashboardSettingController {
  async get(req, res) {
    try {
      logger.info('DASHBOARD', 'Dashboard ayarları yükleniyor', { userId: req.user.id });
      
      let setting = await UserDashboardSetting.findOne({ where: { userId: req.user.id } });
      
      logger.success('DASHBOARD', 'Ayarlar yüklendi');
      res.json(setting?.layout || null);
    } catch (err) {
      logger.error('DASHBOARD', 'Ayarlar yüklenirken hata', err);
      res.status(500).json({ message: err.message });
    }
  }

  async update(req, res) {
    try {
      logger.info('DASHBOARD', 'Dashboard ayarları güncelleniyor', { userId: req.user.id });
      
      const layout = req.body;
      let setting = await UserDashboardSetting.findOne({ where: { userId: req.user.id } });
      
      if (setting) {
        await setting.update({ layout });
      } else {
        setting = await UserDashboardSetting.create({ userId: req.user.id, layout });
      }
      
      logger.success('DASHBOARD', 'Ayarlar kaydedildi');
      res.json(setting.layout);
    } catch (err) {
      logger.error('DASHBOARD', 'Ayarlar kaydedilirken hata', err);
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new DashboardSettingController();

