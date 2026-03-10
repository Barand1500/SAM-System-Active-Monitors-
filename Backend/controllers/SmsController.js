const SmsService = require("../services/SmsService");

class SmsController {
  // === GROUPS ===
  async listGroups(req, res) {
    try {
      const groups = await SmsService.listGroups(req.user.company_id);
      res.json(groups);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async createGroup(req, res) {
    try {
      if (!req.body.name) return res.status(400).json({ error: "Grup adı gerekli" });
      const group = await SmsService.createGroup(req.user.company_id, req.user.id, req.body);
      res.status(201).json(group);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async updateGroup(req, res) {
    try {
      const group = await SmsService.updateGroup(req.params.id, req.user.company_id, req.body);
      res.json(group);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteGroup(req, res) {
    try {
      const result = await SmsService.deleteGroup(req.params.id, req.user.company_id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // === SEND + HISTORY ===
  async listHistory(req, res) {
    try {
      const history = await SmsService.listHistory(req.user.company_id);
      res.json(history);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async send(req, res) {
    try {
      if (!req.body.message) return res.status(400).json({ error: "Mesaj gerekli" });
      if (!req.body.recipients || req.body.recipients.length === 0) {
        return res.status(400).json({ error: "En az bir alıcı gerekli" });
      }
      const record = await SmsService.send(req.user.company_id, req.user.id, req.body);
      res.status(201).json(record);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new SmsController();
