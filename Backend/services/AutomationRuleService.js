const { AutomationRule } = require("../models");

class AutomationRuleService {
  async create(data) {
    return AutomationRule.create(data);
  }

  async getByCompany(company_id) {
    return AutomationRule.findAll({ where: { companyId: company_id } });
  }

  async getById(id) {
    return AutomationRule.findByPk(id);
  }

  async update(id, data) {
    const rule = await AutomationRule.findByPk(id);
    if (!rule) throw new Error("Automation rule not found");
    return rule.update(data);
  }

  async delete(id) {
    const rule = await AutomationRule.findByPk(id);
    if (!rule) throw new Error("Automation rule not found");
    return rule.destroy();
  }

  async toggleActive(id) {
    const rule = await AutomationRule.findByPk(id);
    if (!rule) throw new Error("Automation rule not found");
    rule.isActive = !rule.isActive;
    await rule.save();
    return rule;
  }
}

module.exports = new AutomationRuleService();
