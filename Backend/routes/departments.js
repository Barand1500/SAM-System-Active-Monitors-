const express = require("express");
const router = express.Router();
const DepartmentController = require("../controllers/DepartmentController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

router.use(authenticate, companyIsolation);

router.get("/", DepartmentController.list);
router.get("/:id", DepartmentController.get);
router.post("/", authorizeRoles("boss", "manager"), DepartmentController.create);
router.put("/:id", authorizeRoles("boss", "manager"), DepartmentController.update);
router.delete("/:id", authorizeRoles("boss", "manager"), DepartmentController.delete);

module.exports = router;
