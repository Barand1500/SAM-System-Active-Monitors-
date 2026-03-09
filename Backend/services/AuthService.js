const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Company, TaskStatus, TaskPriority, Department, BreakType, Workspace, Project, TaskList } = require("../models");
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
    companyData.companyCode = await this.generateCompanyCode();

    const company = await Company.create(companyData);

    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const user = await userRepo.create({
      ...adminData,
      companyId: company.id,
      role: "boss",
      password: hashedPassword
    });

    // Varsayılan TaskStatus'ları oluştur
    await TaskStatus.bulkCreate([
      { companyId: company.id, name: 'Beklemede', color: '#94a3b8', orderNo: 1, isDefault: true },
      { companyId: company.id, name: 'Devam Ediyor', color: '#3b82f6', orderNo: 2 },
      { companyId: company.id, name: 'İncelemede', color: '#f59e0b', orderNo: 3 },
      { companyId: company.id, name: 'Tamamlandı', color: '#22c55e', orderNo: 4 }
    ]);

    // Varsayılan TaskPriority'leri oluştur
    await TaskPriority.bulkCreate([
      { companyId: company.id, name: 'Düşük', color: '#94a3b8', orderNo: 1 },
      { companyId: company.id, name: 'Normal', color: '#3b82f6', orderNo: 2 },
      { companyId: company.id, name: 'Yüksek', color: '#f59e0b', orderNo: 3 },
      { companyId: company.id, name: 'Acil', color: '#ef4444', orderNo: 4 }
    ]);

    // Varsayılan departman oluştur
    await Department.create({ companyId: company.id, name: 'Genel' });

    // Varsayılan BreakType'ları oluştur
    await BreakType.bulkCreate([
      { companyId: company.id, name: 'Öğle Yemeği', maxDuration: 60 },
      { companyId: company.id, name: 'Kahve Molası', maxDuration: 15 },
      { companyId: company.id, name: 'Kişisel', maxDuration: 30 }
    ]);

    // Varsayılan Workspace → Project → TaskList zinciri oluştur
    const workspace = await Workspace.create({ companyId: company.id, createdBy: user.id, name: 'Genel Çalışma Alanı' });
    const project = await Project.create({ workspaceId: workspace.id, createdBy: user.id, name: 'Genel Proje', status: 'active' });
    await TaskList.create({ projectId: project.id, name: 'Yapılacaklar', orderNo: 1 });

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

  // Şirket koduna katıl (public join)
  async joinCompany(companyCode, employeeData) {
    // Şirket koduna göre şirketi bul
    const company = await Company.findOne({ where: { company_code: companyCode } });
    if (!company) throw new Error("Invalid company code");

    // Email unique olmalı (global olarak)
    const existingUser = await userRepo.findByEmail(employeeData.email);
    if (existingUser) throw new Error("Email already exists");

    const allowedRoles = ["employee", "manager"];
    const role = allowedRoles.includes(employeeData.role) ? employeeData.role : "employee";

    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    const user = await userRepo.create({
      ...employeeData,
      companyId: company.id,
      password: hashedPassword,
      role
    });

    const token = this.generateJWT(user);
    return { user: this.sanitizeUser(user), company, token };
  }

  // Login
  async login(email, password, companyCode = null) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error("User not found");

    // Eğer companyCode gönderildiyse, user'ın şirketi ile eşleş
    if (companyCode) {
      const company = await Company.findOne({ where: { company_code: companyCode } });
      if (!company || company.id !== user.companyId) {
        throw new Error("Invalid company code");
      }
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Invalid password");

    const token = this.generateJWT(user);
    
    // Company bilgisini de dön
    const company = await Company.findByPk(user.companyId);
    
    return { user: this.sanitizeUser(user), company, token };
  }
}

module.exports = new AuthService();