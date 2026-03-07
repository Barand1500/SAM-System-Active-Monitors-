const AuthService = require("../services/AuthService");

class AuthController {
  async registerCompany(req, res) {
    try {
      const { company, admin } = req.body; // body: { company: {}, admin: {} }
      const result = await AuthService.registerCompany(company, admin);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async registerEmployee(req, res) {
    try {
      const employeeData = {
        ...req.body,
        company_id: req.user.company_id,  // Force company from token
      };
      const result = await AuthService.registerEmployee(employeeData);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json(result);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }
}

module.exports = new AuthController();