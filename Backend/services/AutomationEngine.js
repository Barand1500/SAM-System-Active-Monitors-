const { AutomationRule, Notification } = require("../models");
const logger = require("../utils/logger");

class AutomationEngine {
  /**
   * Trigger an event and execute matching automation rules.
   * @param {string} eventName - e.g. "task.created", "task.status_changed", "leave.created"
   * @param {object} context - event data { company_id, user_id, data: {...} }
   */
  async trigger(eventName, context) {
    try {
      const rules = await AutomationRule.findAll({
        where: {
          companyId: context.company_id,
          triggerEvent: eventName,
          isActive: true,
        },
      });

      if (rules.length === 0) return;

      logger.info(`AutomationEngine: ${rules.length} rule(s) matched event "${eventName}"`);

      for (const rule of rules) {
        try {
          const conditionMet = this.evaluateCondition(rule.condition, context);
          if (conditionMet) {
            await this.executeAction(rule.action, context);
            logger.info(`AutomationEngine: Rule #${rule.id} "${rule.name}" executed`);
          }
        } catch (err) {
          logger.error(`AutomationEngine: Rule #${rule.id} error: ${err.message}`);
        }
      }
    } catch (err) {
      logger.error(`AutomationEngine: trigger error: ${err.message}`);
    }
  }

  /**
   * Evaluate the condition JSON string.
   * Condition format: JSON string like '{"field":"status","operator":"eq","value":"completed"}'
   * Returns true if no condition or condition is met.
   */
  evaluateCondition(conditionStr, context) {
    if (!conditionStr) return true;

    try {
      const condition = typeof conditionStr === "string" ? JSON.parse(conditionStr) : conditionStr;
      const { field, operator, value } = condition;

      if (!field || !operator) return true;

      const actual = context.data?.[field];

      switch (operator) {
        case "eq":
          return String(actual) === String(value);
        case "neq":
          return String(actual) !== String(value);
        case "gt":
          return Number(actual) > Number(value);
        case "lt":
          return Number(actual) < Number(value);
        case "contains":
          return String(actual).includes(String(value));
        default:
          return true;
      }
    } catch {
      return true;
    }
  }

  /**
   * Execute the action JSON string.
   * Action format: JSON string like '{"type":"notification","message":"Task completed","targetUserId":5}'
   */
  async executeAction(actionStr, context) {
    if (!actionStr) return;

    try {
      const action = typeof actionStr === "string" ? JSON.parse(actionStr) : actionStr;

      switch (action.type) {
        case "notification":
          await Notification.create({
            user_id: action.targetUserId || context.user_id,
            company_id: context.company_id,
            title: action.title || "Otomasyon Bildirimi",
            message: action.message || "",
            type: "automation",
          });
          break;

        case "log":
          logger.info(`AutomationAction [log]: ${action.message || JSON.stringify(context.data)}`);
          break;

        default:
          logger.warn(`AutomationEngine: Unknown action type "${action.type}"`);
      }
    } catch (err) {
      logger.error(`AutomationEngine: executeAction error: ${err.message}`);
    }
  }
}

module.exports = new AutomationEngine();
