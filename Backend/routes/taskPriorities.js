const express = require("express");
const router = express.Router();
const TaskPriorityController = require("../controllers/TaskPriorityController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

router.use(authenticate, companyIsolation);

router.get("/", TaskPriorityController.list);
router.get("/:id", TaskPriorityController.get);
router.post("/", authorizeRoles("boss", "manager"), TaskPriorityController.create);
router.put("/reorder", authorizeRoles("boss", "manager"), TaskPriorityController.reorder);
router.put("/:id", authorizeRoles("boss", "manager"), TaskPriorityController.update);
router.delete("/:id", authorizeRoles("boss", "manager"), TaskPriorityController.delete);

module.exports = router;
