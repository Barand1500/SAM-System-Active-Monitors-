const AuthService = require("../services/AuthService");
const EmailService = require("../services/EmailService");

function normalizeAuthError(err) {
  if (!err) return "Bilinmeyen hata";

  if (err.name === "SequelizeUniqueConstraintError") {
    const field = err.errors?.[0]?.path;
    if (field === "email") return "Bu e-posta zaten kayıtlı";
    return "Aynı bilgilerle kayıt zaten mevcut";
  }

  if (err.name === "SequelizeValidationError") {
    const firstMessage = err.errors?.[0]?.message;
    return firstMessage || "Girilen bilgiler doğrulama kontrolünden geçemedi";
  }

  return err.message || "İşlem sırasında hata oluştu";
}

class AuthController {
  async registerCompany(req, res) {
    try {
      const { company, admin } = req.body;
      const result = await AuthService.registerCompany(company, admin);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: normalizeAuthError(err) });
    }
  }

  async registerEmployee(req, res) {
    try {
      const employeeData = {
        ...req.body,
        companyId: req.user.company_id,
      };
      const result = await AuthService.registerEmployee(employeeData);
      res.status(201).json(result);
    } catch (err) {
      res.status(400).json({ error: normalizeAuthError(err) });
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
      res.status(400).json({ error: normalizeAuthError(err) });
    }
  }

  async login(req, res) {
    try {
      const { email, password, companyCode } = req.body;
      console.log('[AuthController] Login request:', { email, hasPassword: !!password, companyCode });
      const result = await AuthService.login(email, password, companyCode);
      res.status(200).json(result);
    } catch (err) {
      console.error('[AuthController] Login error:', err.message);
      res.status(401).json({ error: normalizeAuthError(err) });
    }
  }

  async checkCompanyCode(req, res) {
    try {
      const { code, currentCompanyId } = req.query;
      if (!code) return res.json({ available: false, reason: 'empty' });
      const available = await AuthService.checkCompanyCodeAvailability(code, currentCompanyId);
      res.json(available);
    } catch (err) {
      res.status(500).json({ error: normalizeAuthError(err) });
    }
  }

  async updateCompanyCode(req, res) {
    try {
      const result = await AuthService.updateCompanyCode(req.user.company_id, req.body.companyCode);
      res.json(result);
    } catch (err) {
      res.status(400).json({ error: normalizeAuthError(err) });
    }
  }

  async sendVerificationCode(req, res) {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: "E-posta adresi gerekli" });
      await EmailService.sendVerificationCode(email);
      res.json({ message: "Doğrulama kodu gönderildi" });
    } catch (err) {
      console.error("[AuthController] Email error:", err.message);
      res.status(500).json({ error: "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin." });
    }
  }

  async verifyEmailCode(req, res) {
    try {
      const { email, code } = req.body;
      if (!email || !code) return res.status(400).json({ error: "E-posta ve kod gerekli" });
      const result = await EmailService.verifyCode(email, code);
      if (!result.valid) return res.status(400).json({ error: result.message });
      res.json({ verified: true });
    } catch (err) {
      res.status(500).json({ error: normalizeAuthError(err) });
    }
  }
}

module.exports = new AuthController();