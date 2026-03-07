const express = require("express");
const router = express.Router();
const AutomationRuleController = require("../controllers/AutomationRuleController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

router.use(authenticate, companyIsolation);

router.get("/", AutomationRuleController.list);
router.get("/:id", AutomationRuleController.get);
router.post("/", authorizeRoles("boss", "manager"), AutomationRuleController.create);
router.put("/:id", authorizeRoles("boss", "manager"), AutomationRuleController.update);
router.delete("/:id", authorizeRoles("boss", "manager"), AutomationRuleController.delete);
router.patch("/:id/toggle", authorizeRoles("boss", "manager"), AutomationRuleController.toggleActive);

module.exports = router;
