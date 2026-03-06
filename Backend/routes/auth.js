const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");

// POST /api/auth/register-company
router.post("/register-company", AuthController.registerCompany);

// POST /api/auth/register-employee
router.post("/register-employee", AuthController.registerEmployee);

// POST /api/auth/login
router.post("/login", AuthController.login);

module.exports = router;