const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Company } = require("../models");
const userRepo = require("../repositories/UserRepository");

class AuthService {
  // Şirket için benzersiz 8 haneli kod üret
  async generateCompanyCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code;
    let exists = true;
    while (exists) {
      code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const existing = await Company.findOne({ where: { company_code: code } });
      exists = !!existing;
    }
    return code;
  }

  // JWT üret
  generateJWT(user) {
    return jwt.sign(
      { id: user.id, company_id: user.companyId || user.company_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  }

  // Password'ü response'tan çıkar
  sanitizeUser(user) {
    const userData = user.toJSON ? user.toJSON() : { ...user };
    delete userData.password;
    return userData;
  }

  // Şirket kaydı + ilk admin
  async registerCompany(companyData, adminData) {
    // Şirket kodu üret
    companyData.company_code = await this.generateCompanyCode();

    const company = await Company.create(companyData);

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const user = await userRepo.create({
      ...adminData,
      company_id: company.id,
      role: "boss",
      password: hashedPassword
    });

    const token = this.generateJWT(user);
    return { user: this.sanitizeUser(user), company, token };
  }

  // Çalışan kaydı
  async registerEmployee(employeeData) {
    const allowedRoles = ["employee", "manager"];
    const role = allowedRoles.includes(employeeData.role) ? employeeData.role : "employee";

    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    const user = await userRepo.create({
      ...employeeData,
      password: hashedPassword,
      role
    });

    const token = this.generateJWT(user);
    return { user: this.sanitizeUser(user), token };
  }

  // Login
  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid password");

    const token = this.generateJWT(user);
    return { user: this.sanitizeUser(user), token };
  }
}

module.exports = new AuthService();