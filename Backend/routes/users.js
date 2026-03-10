// Backend/routes/users.js
const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const companyIsolation = require("../middleware/companyIsolation");

// User CRUD
router.get("/", authenticate, companyIsolation, UserController.list);
router.get("/:id", authenticate, companyIsolation, UserController.get);
router.post("/", authenticate, companyIsolation, authorizeRoles("boss", "manager"), UserController.create);
router.put("/:id", authenticate, companyIsolation, UserController.update);
router.put("/:id/skills", authenticate, companyIsolation, UserController.updateSkills);
router.delete("/:id", authenticate, companyIsolation, authorizeRoles("boss", "manager"), UserController.delete);

module.exports = router;