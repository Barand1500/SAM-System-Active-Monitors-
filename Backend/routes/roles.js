const express = require("express");
const router = express.Router();
const RoleController = require("../controllers/RoleController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/", RoleController.list);
router.post("/", authorizeRoles("boss"), RoleController.create);
router.put("/:id", authorizeRoles("boss"), RoleController.update);
router.delete("/:id", authorizeRoles("boss"), RoleController.delete);
router.put("/reorder/sort", authorizeRoles("boss"), RoleController.reorder);

module.exports = router;
