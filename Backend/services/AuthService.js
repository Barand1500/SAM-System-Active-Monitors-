const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Company, TaskStatus, TaskPriority, Department, BreakType, Workspace, Project, TaskList } = require("../models");
const userRepo = require("../repositories/UserRepository");

class AuthService {
  // Şirket için benzersiz 8 haneli kod üret (UPPERCASE olarak)
  async generateCompanyCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code;
    let exists = true;
    while (exists) {
      code = "";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      code = code.toUpperCase();
      const existing = await Company.findOne({ where: { company_code: code } });
      exists = !!existing;
    }
    return code;
  }

  // JWT üret
  generateJWT(user) {
    const companyId = user.companyId || user.company_id;
    
    if (!companyId) {
      console.error("[AuthService] CRITICAL: generateJWT - User without companyId:", {
        userId: user.id,
        email: user.email,
        userCompanyId: user.companyId,
        userCompanyIdSnake: user.company_id
      });
      throw new Error("Cannot generate JWT: User has no company assigned");
    }
    
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured in environment");
    }
    
    return jwt.sign(
      { 
        id: user.id,
        company_id: companyId,
        companyId: companyId,
        role: user.role,
        email: user.email
      },
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
    // CRITICAL: companyId 必ず存在する必要がある
    if (!employeeData.companyId) {
      throw new Error("Company ID is required to register an employee");
    }

    const allowedRoles = ["employee", "manager"];
    const role = allowedRoles.includes(employeeData.role) ? employeeData.role : "employee";

    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    const user = await userRepo.create({
      ...employeeData,
      companyId: employeeData.companyId,
      password: hashedPassword,
      role
    });

    const token = this.generateJWT(user);
    return { user: this.sanitizeUser(user), token };
  }

  // Şirket koduna katıl (public join)
  async joinCompany(companyCode, employeeData) {
    // Şirket koduna göre şirketi bul
    const company = await Company.findOne({ where: { company_code: companyCode.toUpperCase() } });
    if (!company) throw new Error("Invalid company code");

    // Email unique olmalı (global olarak)
    const existingUser = await userRepo.findByEmail(employeeData.email);
    if (existingUser) throw new Error("Email already exists");

    const allowedRoles = ["employee", "manager"];
    const role = allowedRoles.includes(employeeData.role) ? employeeData.role : "employee";

    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    
    // CRITICAL: Ensure companyId is set
    const userData = {
      ...employeeData,
      companyId: company.id,
      password: hashedPassword,
      role
    };
    
    const user = await userRepo.create(userData);
    
    // Verify user has company assigned
    if (!user.companyId) {
      throw new Error("Failed to assign company to user");
    }

    const token = this.generateJWT(user);
    return { user: this.sanitizeUser(user), company, token };
  }

  // Login
  async login(email, password, companyCode = null) {
    console.log('[AuthService] Login attempt:', { email, companyCode: companyCode || 'none' });
    
    const user = await userRepo.findByEmail(email);
    if (!user) {
      console.log('[AuthService] User not found:', email);
      throw new Error("Bu e-posta ile kayıtlı kullanıcı bulunamadı");
    }

    // Eğer companyCode gönderildiyse, user'ın şirketi ile eşleş
    if (companyCode) {
      const company = await Company.findOne({ where: { company_code: companyCode } });
      if (!company) {
        console.log('[AuthService] Company not found for code:', companyCode);
        throw new Error("Şirket kodu geçersiz");
      }
      if (company.id !== user.companyId) {
        console.log('[AuthService] Company mismatch:', { userCompanyId: user.companyId, codeCompanyId: company.id });
        throw new Error("Bu kullanıcı bu şirkete ait değil");
      }
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('[AuthService] Invalid password for:', email);
      throw new Error("Şifre hatalı");
    }

    // Eğer kullanıcının şirketi yoksa, ilk şirkete ata (production fix)
    if (!user.companyId) {
      console.warn("[AuthService] User has no company, assigning to first company:", { userId: user.id, email: user.email });
      const firstCompany = await Company.findOne({ order: [['id', 'ASC']] });
      if (firstCompany) {
        user.companyId = firstCompany.id;
        await user.save();
        console.log("[AuthService] User assigned to company:", { userId: user.id, companyId: firstCompany.id });
      }
    }

    const token = this.generateJWT(user);
    
    // Company bilgisini de dön
    const company = await Company.findByPk(user.companyId);
    
    return { user: this.sanitizeUser(user), company, token };
  }

  // Şirket kodu müsaitlik kontrolü
  async checkCompanyCodeAvailability(code, currentCompanyId) {
    if (!code) return { available: false, reason: 'empty' };
    const upperCode = code.toUpperCase();
    const existing = await Company.findOne({ where: { company_code: upperCode } });
    if (existing && String(existing.id) !== String(currentCompanyId)) {
      return { available: false, reason: 'taken' };
    }
    return { available: true };
  }

  // Şirket kodunu güncelle
  async updateCompanyCode(companyId, newCode) {
    if (!newCode) throw new Error('Şirket kodu boş olamaz');
    const upperCode = newCode.toUpperCase();
    const existing = await Company.findOne({ where: { company_code: upperCode } });
    if (existing && existing.id !== companyId) {
      throw new Error('Bu şirket kodu zaten kullanımda');
    }
    const company = await Company.findByPk(companyId);
    if (!company) throw new Error('Şirket bulunamadı');
    company.companyCode = upperCode;
    await company.save();
    return { company };
  }
}

module.exports = new AuthService();