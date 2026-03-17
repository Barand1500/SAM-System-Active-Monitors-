// Backend/controllers/CompanySettingController.js
const CompanySettingService = require("../services/CompanySettingService");

class CompanySettingController {
  async get(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Şirket kimliği bulunamadı" });
      }
      const settings = await CompanySettingService.getByCompany(companyId);
      res.json(settings || {});
    } catch (err) {
      console.error('[CompanySettingController] get error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Şirket kimliği bulunamadı" });
      }
      const { company_id, id, profileData, foldersData, ...safeData } = req.body;
      const settings = await CompanySettingService.upsert(companyId, safeData);
      res.json(settings);
    } catch (err) {
      console.error('[CompanySettingController] update error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async getProfile(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Şirket kimliği bulunamadı" });
      }
      const settings = await CompanySettingService.getByCompany(companyId);
      res.json(settings?.profileData || {});
    } catch (err) {
      console.error('[CompanySettingController] getProfile error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Şirket kimliği bulunamadı" });
      }
      const profileData = req.body;
      const settings = await CompanySettingService.upsert(companyId, { profileData });
      res.json(settings.profileData);
    } catch (err) {
      console.error('[CompanySettingController] updateProfile error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async getFolders(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;

      if (!companyId) {
        console.error('[CompanySettingController.getFolders] CRITICAL - Missing company_id:', {
          userId: req.user?.id,
          hasCompanyId: !!companyId,
          userKeys: Object.keys(req.user || {})
        });
        return res.status(400).json({ 
          error: "Şirket kimliği kullanıcı bağlamında bulunamadı"
        });
      }

      const settings = await CompanySettingService.getByCompany(companyId);
      res.json(settings?.foldersData || {});
    } catch (err) {
      console.error('[CompanySettingController] getFolders error:', {
        message: err.message,
        stack: err.stack
      });
      res.status(500).json({ 
        error: "Klasör ayarları yüklenirken hata oluştu"
      });
    }
  }

  async updateFolders(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Şirket kimliği bulunamadı" });
      }
      const foldersData = req.body;
      const settings = await CompanySettingService.upsert(companyId, { foldersData });
      res.json(settings.foldersData);
    } catch (err) {
      console.error('[CompanySettingController] updateFolders error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async uploadLogo(req, res) {
    try {
      const companyId = req.user?.company_id || req.user?.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Şirket kimliği bulunamadı" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Dosya yüklenmedi" });
      }

      // Dosya yolu oluştur (logos klasörüne kaydedilen dosyalar)
      const logoUrl = "/uploads/logos/" + req.file.filename;

      // Şirket profili settings'ini güncelle
      const settings = await CompanySettingService.upsert(companyId, {
        profileData: { logoUrl }
      });

      res.json({
        message: "Logo başarıyla yüklendi",
        logoUrl,
        data: settings.profileData
      });
    } catch (err) {
      console.error('[CompanySettingController] uploadLogo error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new CompanySettingController();