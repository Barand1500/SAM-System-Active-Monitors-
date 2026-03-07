const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const { validate, rules } = require("../middleware/ValidationMiddleware");

// POST /api/auth/register-company
router.post("/register-company", rules.registerCompany, validate, AuthController.registerCompany);

// POST /api/auth/register-employee (only boss/manager can add employees)
router.post("/register-employee", authenticate, authorizeRoles("boss", "manager"), AuthController.registerEmployee);

// POST /api/auth/login
router.post("/login", rules.login, validate, AuthController.login);

module.exports = router;