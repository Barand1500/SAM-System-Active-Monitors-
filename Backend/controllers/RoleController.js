const RoleService = require("../services/RoleService");

class RoleController {
  async list(req, res) {
    try {
      const roles = await RoleService.list(req.user.company_id);
      res.json(roles);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      if (!req.body.label) return res.status(400).json({ error: "Rol adı gerekli" });
      const role = await RoleService.create(req.user.company_id, req.body);
      res.status(201).json(role);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const role = await RoleService.update(req.params.id, req.user.company_id, req.body);
      res.json(role);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const result = await RoleService.delete(req.params.id, req.user.company_id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async reorder(req, res) {
    try {
      const result = await RoleService.reorder(req.user.company_id, req.body.orderedIds);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new RoleController();
