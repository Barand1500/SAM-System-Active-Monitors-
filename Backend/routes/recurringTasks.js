const express = require("express");
const router = express.Router();
const RecurringTaskController = require("../controllers/RecurringTaskController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

router.use(authenticate, companyIsolation);

router.get("/", RecurringTaskController.list);
router.get("/:id", RecurringTaskController.get);
router.post("/", authorizeRoles("boss", "manager"), RecurringTaskController.create);
router.put("/:id", authorizeRoles("boss", "manager"), RecurringTaskController.update);
router.delete("/:id", authorizeRoles("boss", "manager"), RecurringTaskController.delete);
router.patch("/:id/toggle", authorizeRoles("boss", "manager"), RecurringTaskController.toggleActive);

module.exports = router;
