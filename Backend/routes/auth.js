const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");
const { validate, rules } = require("../middleware/ValidationMiddleware");

// POST /api/auth/register-company
router.post("/register-company", rules.registerCompany, validate, AuthController.registerCompany);

// POST /api/auth/register-employee (only boss/manager can add employees)
router.post("/register-employee", authenticate, authorizeRoles("boss", "manager"), rules.registerEmployee, validate, AuthController.registerEmployee);

// POST /api/auth/join-company (public - herkes şirket koduna katılabilir)
router.post("/join-company", AuthController.joinCompany);

// POST /api/auth/login
router.post("/login", rules.login, validate, AuthController.login);

// GET /api/auth/check-company-code?code=XXX&currentCompanyId=1
router.get("/check-company-code", authenticate, AuthController.checkCompanyCode);

// PUT /api/auth/update-company-code
router.put("/update-company-code", authenticate, authorizeRoles("boss"), AuthController.updateCompanyCode);

// POST /api/auth/send-verification-code (public)
router.post("/send-verification-code", AuthController.sendVerificationCode);

// POST /api/auth/verify-email-code (public)
router.post("/verify-email-code", AuthController.verifyEmailCode);

module.exports = router;