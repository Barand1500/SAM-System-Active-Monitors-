const express = require("express");
const router = express.Router();
const TaskStatusController = require("../controllers/TaskStatusController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

router.use(authenticate, companyIsolation);

router.get("/", TaskStatusController.list);
router.get("/:id", TaskStatusController.get);
router.post("/", authorizeRoles("boss", "manager"), TaskStatusController.create);
router.put("/reorder", authorizeRoles("boss", "manager"), TaskStatusController.reorder);
router.put("/:id", authorizeRoles("boss", "manager"), TaskStatusController.update);
router.delete("/:id", authorizeRoles("boss", "manager"), TaskStatusController.delete);

module.exports = router;
