const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { fn, col, where } = require("sequelize");
const { Company, User, TaskStatus, TaskPriority, Department, BreakType, Workspace, Project, TaskList, Role } = require("../models");
const userRepo = require("../repositories/UserRepository");
const EmailService = require("./EmailService");

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

  // Rastgele şifre üret (8 karakter)
  generateRandomPassword() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
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
      throw new Error("JWT oluşturulamadı: Kullanıcının atanmış şirketi yok");
    }
    
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET ortam değişkeninde yapılandırılmamış");
    }
    
    return jwt.sign(
      { 
        id: user.id,
        company_id: companyId,
        companyId: companyId,
        role: user.role,
        roles: user.roles || (user.role ? [user.role] : ['employee']),
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
    // roles null ise role ENUM'dan türet
    if (!userData.roles) {
      userData.roles = userData.role ? [userData.role] : ['employee'];
    }
    return userData;
  }

  // Şirket kaydı + ilk admin
  async registerCompany(companyData, adminData) {
    // Şirket tipi doğrulama (gerçek kişi → TC, tüzel kişi → vergi no)
    const companyType = companyData.companyType || 'gercek';
    
    // Gerçek kişi: şirket adı = ad soyad
    if (companyType === 'gercek') {
      companyData.name = `${adminData.firstName} ${adminData.lastName}`.trim();
    }

    const normalizedCompanyName = (companyData?.name || "").trim();
    if (!normalizedCompanyName) {
      throw new Error("Şirket adı zorunludur");
    }

    const existingCompany = await Company.findOne({
      where: where(fn("LOWER", col("name")), normalizedCompanyName.toLowerCase())
    });

    if (existingCompany) {
      throw new Error("Bu şirket adı zaten kullanımda");
    }

    if (companyType === 'gercek') {
      const tc = (companyData.tcNo || '').replace(/\D/g, '');
      if (!tc || tc.length !== 11) {
        throw new Error('TC Kimlik numarası 11 haneli olmalıdır');
      }
      if (!/^[1-9]/.test(tc)) {
        throw new Error('TC Kimlik numarası 0 ile başlayamaz');
      }
      // TC Kimlik algoritma doğrulama
      const digits = tc.split('').map(Number);
      const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
      const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
      if ((sum1 - sum2) % 10 !== digits[9]) {
        throw new Error('Geçersiz TC Kimlik numarası');
      }
      const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
      if (totalSum % 10 !== digits[10]) {
        throw new Error('Geçersiz TC Kimlik numarası');
      }
      // Aynı TC ile kayıtlı şirket kontrolü
      const existingTc = await Company.findOne({ where: { tc_no: tc } });
      if (existingTc) {
        throw new Error('Bu TC Kimlik numarası ile kayıtlı bir şirket zaten mevcut');
      }
      companyData.tcNo = tc;
      companyData.vergiNo = null;
      companyData.vergiDairesi = null;
    } else if (companyType === 'tuzel') {
      const vn = (companyData.vergiNo || '').replace(/\D/g, '');
      if (!vn || vn.length !== 10) {
        throw new Error('Vergi numarası 10 haneli olmalıdır');
      }
      if (!(companyData.vergiDairesi || '').trim()) {
        throw new Error('Vergi dairesi zorunludur');
      }
      // Aynı vergi numarası kontrolü
      const existingVn = await Company.findOne({ where: { vergi_no: vn } });
      if (existingVn) {
        throw new Error('Bu vergi numarası ile kayıtlı bir şirket zaten mevcut');
      }
      companyData.vergiNo = vn;
      companyData.vergiDairesi = companyData.vergiDairesi.trim();
      companyData.tcNo = null;
    }
    companyData.companyType = companyType;

    // Global unique email çakışmasını Sequelize seviyesine bırakmadan yakala
    const existingUser = await userRepo.findByEmail(adminData.email);
    if (existingUser) {
      throw new Error("Bu e-posta zaten kayıtlı");
    }

    // Şirket kodu üret
    const generatedCode = await this.generateCompanyCode();

    const company = await Company.create({
      name: normalizedCompanyName,
      companyCode: generatedCode,
      companyType,
      industry: companyData.industry || null,
      tcNo: companyData.tcNo || null,
      vergiNo: companyData.vergiNo || null,
      vergiDairesi: companyData.vergiDairesi || null
    });

    // Şifre otomatik üret ve e-posta ile gönder
    const tempPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const user = await userRepo.create({
      ...adminData,
      companyId: company.id,
      role: "boss",
      roles: ["boss"],
      password: hashedPassword,
      mustChangePassword: true
    });

    // Şifreyi e-posta ile gönder
    try {
      await EmailService.sendPasswordEmail(
        adminData.email,
        tempPassword,
        `${adminData.firstName} ${adminData.lastName}`,
        generatedCode
      );
    } catch (emailErr) {
      console.error('[AuthService] Şifre e-postası gönderilemedi:', emailErr.message);
    }

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

    // Varsayılan Rolleri oluştur
    await Role.bulkCreate([
      { companyId: company.id, roleKey: 'boss', label: 'Patron', color: '#f59e0b', permissions: JSON.stringify(['*']), sortOrder: 0 },
      { companyId: company.id, roleKey: 'manager', label: 'Yönetici', color: '#3b82f6', permissions: JSON.stringify(['task_view_all','task_create','task_edit_all','task_delete_all','task_assign','employee_view_all','employee_create','employee_edit_all','employee_delete','employee_manage_roles','department_view','department_create','department_edit','department_delete','department_manage','leave_view_all','leave_approve','leave_reject','report_view_basic','report_view_advanced','report_export','announcement_view','announcement_create','announcement_edit_all','announcement_delete','file_view_all','file_upload','file_delete_all','company_view_info']), sortOrder: 1 },
      { companyId: company.id, roleKey: 'employee', label: 'Çalışan', color: '#22c55e', permissions: JSON.stringify(['task_view_own','task_edit_own','leave_view_own','leave_create','announcement_view','file_view_own','file_upload']), sortOrder: 2 },
    ]);

    const token = this.generateJWT(user);
    const sanitizedUser = this.sanitizeUser(user);
    sanitizedUser.mustChangePassword = true;
    return { user: sanitizedUser, company, token, tempPassword };
  }

  // Çalışan kaydı
  async registerEmployee(employeeData) {
    // CRITICAL: companyId 必ず存在する必要がある
    if (!employeeData.companyId) {
      throw new Error("Çalışan kaydı için şirket kimliği gereklidir");
    }

    const allowedRoles = ["employee", "manager"];
    const role = allowedRoles.includes(employeeData.role) ? employeeData.role : "employee";

    const hashedPassword = await bcrypt.hash(employeeData.password, 10);
    const user = await userRepo.create({
      ...employeeData,
      companyId: employeeData.companyId,
      password: hashedPassword,
      role,
      roles: [role]
    });

    const token = this.generateJWT(user);
    return { user: this.sanitizeUser(user), token };
  }

  // Şirket koduna katıl (public join)
  async joinCompany(companyCode, employeeData) {
    // Şirket koduna göre şirketi bul
    const company = await Company.findOne({ where: { company_code: companyCode.toUpperCase() } });
    if (!company) throw new Error("Geçersiz şirket kodu");

    // Email unique olmalı (global olarak)
    const existingUser = await userRepo.findByEmail(employeeData.email);
    if (existingUser) throw new Error("Bu e-posta adresi zaten kullanılıyor");

    const allowedRoles = ["employee", "manager"];
    const role = allowedRoles.includes(employeeData.role) ? employeeData.role : "employee";

    // Şifre otomatik üret
    const tempPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    // CRITICAL: Ensure companyId is set
    const userData = {
      ...employeeData,
      companyId: company.id,
      password: hashedPassword,
      role,
      roles: [role],
      mustChangePassword: true
    };
    
    const user = await userRepo.create(userData);
    
    // Verify user has company assigned
    if (!user.companyId) {
      throw new Error("Kullanıcıya şirket atanamadı");
    }

    // Şifreyi e-posta ile gönder
    try {
      await EmailService.sendPasswordEmail(
        employeeData.email,
        tempPassword,
        `${employeeData.firstName} ${employeeData.lastName}`,
        company.company_code || company.companyCode
      );
    } catch (emailErr) {
      console.error('[AuthService] Şifre e-postası gönderilemedi:', emailErr.message);
    }

    const token = this.generateJWT(user);
    const sanitizedUser = this.sanitizeUser(user);
    sanitizedUser.mustChangePassword = true;
    return { user: sanitizedUser, company, token, tempPassword };
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

    // roles null ise ENUM role'den otomatik doldur (eski kullanıcılar için)
    if (!user.roles || (Array.isArray(user.roles) && user.roles.length === 0)) {
      try {
        user.roles = user.role ? [user.role] : ['employee'];
        await user.save();
      } catch (e) {
        // roles sütunu yoksa veya kayıt hatası olursa sessizce devam et
        console.warn('[AuthService] roles güncellenemedi:', e.message);
      }
    }

    const token = this.generateJWT(user);
    
    // Company bilgisini de dön
    const company = await Company.findByPk(user.companyId);
    
    const sanitizedUser = this.sanitizeUser(user);
    sanitizedUser.mustChangePassword = !!user.mustChangePassword;
    return { user: sanitizedUser, company, token };
  }

  // Şifre değiştir (mevcut şifre doğrulama ile)
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('Kullanıcı bulunamadı');
    
    // Mevcut şifreyi doğrula
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error('Mevcut şifre hatalı');
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedPassword, mustChangePassword: false },
      { where: { id: userId } }
    );

    // Yeni şifreyi e-posta ile gönder
    try {
      const company = await Company.findByPk(user.companyId);
      await EmailService.sendPasswordEmail(
        user.email,
        newPassword,
        `${user.firstName} ${user.lastName}`,
        company?.company_code
      );
    } catch (emailErr) {
      console.error('[AuthService] Şifre e-postası gönderilemedi:', emailErr.message);
    }
    
    const updatedUser = await User.findByPk(userId);
    const sanitizedUser = this.sanitizeUser(updatedUser);
    sanitizedUser.mustChangePassword = false;
    return { user: sanitizedUser };
  }

  // Şifremi unuttum - yeni şifre oluştur ve e-posta ile gönder
  async forgotPassword(email, companyCode) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error('Bu e-posta ile kayıtlı kullanıcı bulunamadı');

    if (companyCode) {
      const company = await Company.findOne({ where: { company_code: companyCode } });
      if (!company) throw new Error('Şirket kodu geçersiz');
      if (company.id !== user.companyId) throw new Error('Bu kullanıcı bu şirkete ait değil');
    }

    const newPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      { password: hashedPassword, mustChangePassword: true },
      { where: { id: user.id } }
    );

    const company = await Company.findByPk(user.companyId);
    await EmailService.sendPasswordEmail(
      email,
      newPassword,
      `${user.firstName} ${user.lastName}`,
      company?.company_code
    );

    return { message: 'Yeni şifreniz e-posta adresinize gönderildi' };
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