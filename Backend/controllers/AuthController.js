const AuthService = require("../services/AuthService");

class AuthController {
  async registerCompany(req, res) {
    try {
      const { company, admin } = req.body; // body: { company: {}, admin: {} }
      const result = await AuthService.registerCompany(company, admin);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async registerEmployee(req, res) {
    try {
      const employeeData = {
        ...req.body,
        companyId: req.user.company_id,  // Force company from token (JWT has snake_case)
      };
      const result = await AuthService.registerEmployee(employeeData);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async joinCompany(req, res) {
    try {
      const { company_code, firstName, lastName, email, password, department, position, role } = req.body;
      const result = await AuthService.joinCompany(company_code, {
        firstName,
        lastName,
        email,
        password,
        department: department || 'Genel',
        position: position || 'Çalışan',
        role: role || 'employee'
      });
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password, companyCode } = req.body;
      const result = await AuthService.login(email, password, companyCode);
      res.status(200).json(result);
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  }
}

module.exports = new AuthController();