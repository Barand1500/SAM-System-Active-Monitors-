const AuthService = require("../services/AuthService");
const EmailService = require("../services/EmailService");

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

  async checkCompanyCode(req, res) {
    try {
      const { code, currentCompanyId } = req.query;
      if (!code) return res.json({ available: false, reason: 'empty' });
      const available = await AuthService.checkCompanyCodeAvailability(code, currentCompanyId);
      res.json(available);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }

  async updateCompanyCode(req, res) {
    try {
      const result = await AuthService.updateCompanyCode(req.user.company_id, req.body.companyCode);
      res.json(result);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }

  async sendVerificationCode(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "E-posta adresi gerekli" });
      await EmailService.sendVerificationCode(email);
      res.json({ message: "Doğrulama kodu gönderildi" });
    } catch (err) {
      console.error("Email gönderim hatası:", err);
      res.status(500).json({ message: "E-posta gönderilemedi: " + err.message });
    }
  }

  async verifyEmailCode(req, res) {
    try {
      const { email, code } = req.body;
      if (!email || !code) return res.status(400).json({ message: "E-posta ve kod gerekli" });
      const result = EmailService.verifyCode(email, code);
      if (!result.valid) return res.status(400).json({ message: result.message });
      res.json({ verified: true });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = new AuthController();