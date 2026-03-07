const AutomationRuleService = require("../services/AutomationRuleService");

class AutomationRuleController {
  async list(req, res) {
    try {
      const rules = await AutomationRuleService.getByCompany(req.body.company_id || req.query.company_id);
      res.json(rules);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const rule = await AutomationRuleService.getById(req.params.id);
      if (!rule) return res.status(404).json({ error: "Automation rule not found" });
      if (String(rule.companyId) !== String(req.body.company_id || req.query.company_id)) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(rule);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const { company_id, id, ...safeData } = req.body;
      safeData.company_id = req.user.company_id;
      const rule = await AutomationRuleService.create(safeData);
      res.status(201).json(rule);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async update(req, res) {
    try {
      const rule = await AutomationRuleService.getById(req.params.id);
      if (!rule) return res.status(404).json({ error: "Automation rule not found" });
      if (String(rule.companyId) !== String(req.user.company_id)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { company_id, id, ...safeData } = req.body;
      const updated = await AutomationRuleService.update(req.params.id, safeData);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req, res) {
    try {
      const rule = await AutomationRuleService.getById(req.params.id);
      if (!rule) return res.status(404).json({ error: "Automation rule not found" });
      if (String(rule.companyId) !== String(req.user.company_id)) {
        return res.status(403).json({ error: "Access denied" });
      }
      await AutomationRuleService.delete(req.params.id);
      res.json({ message: "Automation rule deleted" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async toggleActive(req, res) {
    try {
      const rule = await AutomationRuleService.getById(req.params.id);
      if (!rule) return res.status(404).json({ error: "Automation rule not found" });
      if (String(rule.companyId) !== String(req.user.company_id)) {
        return res.status(403).json({ error: "Access denied" });
      }
      const updated = await AutomationRuleService.toggleActive(req.params.id);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new AutomationRuleController();
