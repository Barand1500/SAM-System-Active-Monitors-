const { UserDashboardSetting, sequelize } = require("../models");
const logger = require("../utils/logger");

class DashboardSettingController {
  async get(req, res) {
    try {
      logger.info('DASHBOARD-GET', 'Dashboard ayarları yükleniyor', { userId: req.user.id });
      
      let setting = await UserDashboardSetting.findOne({ where: { userId: req.user.id } });
      
      logger.success('DASHBOARD-GET', 'Ayarlar yüklendi', { 
        hasLayout: !!setting?.layout,
        layoutLength: setting?.layout ? JSON.stringify(setting.layout).length : 0
      });
      
      res.json(setting?.layout || null);
    } catch (err) {
      logger.error('DASHBOARD-GET', 'Ayarlar yüklenirken hata', err);
      res.status(500).json({ message: err.message });
    }
  }

  async update(req, res) {
    const t = await sequelize.transaction();
    
    try {
      const userId = req.user.id;
      const layout = req.body;
      
      logger.info('DASHBOARD-UPDATE', 'Dashboard ayarları güncelleniyor', { 
        userId,
        layoutKeys: Object.keys(layout || {}),
        layoutSize: JSON.stringify(layout).length
      });
      
      // Mevcut ayarı bul
      let setting = await UserDashboardSetting.findOne({ 
        where: { userId },
        transaction: t
      });
      
      if (setting) {
        // Güncelle
        logger.info('DASHBOARD-UPDATE', 'Mevcut ayar güncelleniyor', { settingId: setting.id });
        await setting.update({ layout }, { transaction: t });
        logger.success('DASHBOARD-UPDATE', '✅ Ayar güncellendi', { settingId: setting.id });
      } else {
        // Yeni oluştur
        logger.info('DASHBOARD-UPDATE', 'Yeni ayar oluşturuluyor');
        setting = await UserDashboardSetting.create({ 
          userId, 
          layout 
        }, { transaction: t });
        logger.success('DASHBOARD-UPDATE', '✅ Yeni ayar oluşturuldu', { settingId: setting.id });
      }
      
      // Transaction'ı commit et
      await t.commit();
      logger.success('DASHBOARD-UPDATE', '✅ Dashboard ayarları DB\'ye kaydedildi', { 
        userId,
        settingId: setting.id 
      });
      
      res.json(setting.layout);
    } catch (err) {
      // Hata durumunda transaction'ı geri al
      await t.rollback();
      logger.error('DASHBOARD-UPDATE', '❌ Ayarlar kaydedilirken hata (transaction rollback)', {
        userId: req.user.id,
        error: err.message,
        stack: err.stack
      });
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new DashboardSettingController();

