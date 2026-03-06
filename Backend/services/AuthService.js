const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Company } = require("../models");
const userRepo = require("../repositories/UserRepository");

class AuthService {
  // Şirket için benzersiz 8 haneli kod üret
  generateCompanyCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // JWT üret
  generateJWT(user) {
    return jwt.sign(
      { id: user.id, company_id: user.company_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
  }

  // Şirket kaydı + ilk admin
  async registerCompany(companyData, adminData) {
    // Şirket kodu üret
    companyData.company_code = this.generateCompanyCode();

    const company = await Company.create(companyData);

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const user = await userRepo.create({
      ...adminData,
      company_id: company.id,
      role: "boss",
      password: hashedPassword
    });

    const token = this.generateJWT(user);
    return { user, company, token };
  }

  // Çalışan kaydı
  async registerEmployee(employeeData) {
    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    const user = await userRepo.create({
      ...employeeData,
      password: hashedPassword,
      role: employeeData.role || "employee"
    });

    const token = this.generateJWT(user);
    return { user, token };
  }

  // Login
  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid password");

    const token = this.generateJWT(user);
    return { user, token };
  }
}

module.exports = new AuthService();