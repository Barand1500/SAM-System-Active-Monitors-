// Backend/controllers/UserController.js
const UserService = require("../services/UserService");

class UserController {
  async list(req, res) {
    try {
      const companyId = req.user.company_id || req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const users = await UserService.listByCompany(companyId);
      res.json(users || []);
    } catch (err) {
      console.error('[UserController] list error:', err.message);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  }

  async create(req, res) {
    try {
      const companyId = req.user.company_id || req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      // Ensure companyId is in the request
      const userData = { ...req.body, companyId };
      const user = await UserService.createUser(userData);
      res.status(201).json(user);
    } catch (err) {
      console.error('[UserController] create error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const companyId = req.user.company_id || req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const user = await UserService.updateUser(req.params.id, req.body, companyId);
      res.json(user);
    } catch (err) {
      console.error('[UserController] update error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const companyId = req.user.company_id || req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const user = await UserService.getUserWithSkills(req.params.id, companyId);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (err) {
      console.error('[UserController] get error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const companyId = req.user.company_id || req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      await UserService.deleteUser(req.params.id, companyId);
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error('[UserController] delete error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async updateSkills(req, res) {
    try {
      const companyId = req.user.company_id || req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      const user = await UserService.updateSkills(req.params.id, companyId, req.body.skills);
      res.json(user);
    } catch (err) {
      console.error('[UserController] updateSkills error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }

  async uploadAvatar(req, res) {
    try {
      const companyId = req.user.company_id || req.user.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "Company ID not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Dosya yolu oluştur (avatars klasörüne kaydedilen dosyalar)
      const avatarUrl = "/uploads/avatars/" + req.file.filename;
      
      // User'ı güncelle
      const user = await UserService.updateUser(req.params.id, { avatarUrl }, companyId);
      
      res.json({
        message: "Avatar uploaded successfully",
        avatarUrl,
        user
      });
    } catch (err) {
      console.error('[UserController] uploadAvatar error:', err.message);
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new UserController();