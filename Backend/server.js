const http = require('http');
const { Server: SocketIO } = require('socket.io');
require('dotenv').config();
const app = require('./app');
const { authenticate, authorizeRoles } = require('./middleware/authMiddleware');

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new SocketIO(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket] Bağlandı: ${socket.id}`);

  socket.on('join_company', (companyId) => {
    socket.join(`company_${companyId}`);
  });

  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Ayrıldı: ${socket.id}`);
  });
});

// io'yu route'lara iletilebilir hale getir
app.set('io', io);

// ─── Admin restart endpoint (auth required) ─────────────────────────────────────
// Kullanım: POST /admin/restart (JWT token gerekli + boss role)
app.post('/admin/restart', authenticate, authorizeRoles('boss'), (req, res) => {
  console.log(`[RESTART] Admin restart triggered by user ${req.user.id} (${req.user.email})`);
  res.json({ message: 'Sunucu yeniden başlatılacak...' });
  setTimeout(() => {
    console.log('[RESTART] Process exiting - PM2 will auto-restart');
    process.exit(0);
  }, 1000);
});

// ─── Sunucuyu başlat ──────────────────────────────────────────────────────────
httpServer.listen(PORT, async () => {
  // Eksik kolonları otomatik ekle (alter: true sadece yeni kolon ekler, veri silmez)
  try {
    const sequelize = require('./config/database');
    // Production'da alter:true risklidir; sadece yeni tablo oluştur, mevcut tabloları değiştirme
    const isProduction = (process.env.NODE_ENV || '').toLowerCase() === 'production';
    await sequelize.sync({ alter: !isProduction });
    console.log('[DB] Tablo senkronizasyonu tamamlandı');
  } catch (err) {
    console.error('[DB] Sync hatası:', err.message);
  }

  // Eksik varsayılan rolleri otomatik oluştur (her şirket için boss/manager/employee)
  try {
    const { Company, Role, User } = require('./models');
    const DEFAULT_ROLES = [
      { roleKey: 'boss', label: 'Patron', color: '#f59e0b', permissions: ['*'], sortOrder: 0 },
      { roleKey: 'manager', label: 'Yönetici', color: '#3b82f6', permissions: ['task_view_all','task_create','task_edit_all','task_delete_all','task_assign','employee_view_all','employee_create','employee_edit_all','employee_delete','employee_manage_roles','department_view','department_create','department_edit','department_delete','department_manage','leave_view_all','leave_approve','leave_reject','report_view_basic','report_view_advanced','report_export','announcement_view','announcement_create','announcement_edit_all','announcement_delete','file_view_all','file_upload','file_delete_all','company_view_info'], sortOrder: 1 },
      { roleKey: 'employee', label: 'Çalışan', color: '#22c55e', permissions: ['task_view_own','task_edit_own','leave_view_own','leave_create','announcement_view','file_view_own','file_upload'], sortOrder: 2 },
    ];
    const companies = await Company.findAll({ attributes: ['id'] });
    for (const company of companies) {
      // Varsayılan rolleri ekle
      for (const def of DEFAULT_ROLES) {
        const exists = await Role.findOne({ where: { company_id: company.id, role_key: def.roleKey } });
        if (!exists) {
          await Role.create({ companyId: company.id, ...def });
          console.log(`[SEED] Rol eklendi: ${def.roleKey} -> şirket ${company.id}`);
        }
      }

      // Kullanıcıların roles JSON'ında olup roles tablosunda olmayan rolleri otomatik oluştur
      const companyUsers = await User.findAll({ where: { company_id: company.id }, attributes: ['id', 'roles'] });
      const existingRoles = await Role.findAll({ where: { company_id: company.id }, attributes: ['role_key'] });
      const existingKeys = new Set(existingRoles.map(r => r.roleKey || r.role_key));
      
      for (const u of companyUsers) {
        const userRoles = Array.isArray(u.roles) ? u.roles : [];
        for (const rk of userRoles) {
          if (rk && !existingKeys.has(rk)) {
            // Rol tablosunda yok — otomatik oluştur (izinsiz, patron AdminPanel'den ayarlasın)
            const label = rk.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            await Role.create({ companyId: company.id, roleKey: rk, label, color: '#8b5cf6', permissions: [], sortOrder: 99 });
            existingKeys.add(rk);
            console.log(`[SEED] Eksik özel rol oluşturuldu: ${rk} (${label}) -> şirket ${company.id}`);
          }
        }
      }
    }
    // roles=null olan kullanıcıları ENUM role'den otomatik doldur
    const nullRoleUsers = await User.findAll({ where: { roles: null } });
    for (const u of nullRoleUsers) {
      u.roles = u.role ? [u.role] : ['employee'];
      await u.save();
      console.log(`[SEED] Kullanıcı rolleri düzeltildi: ${u.id} ${u.firstName} -> ${JSON.stringify(u.roles)}`);
    }
  } catch (err) {
    console.error('[SEED] Varsayılan rol oluşturma hatası:', err.message);
  }

  // Start recurring task scheduler (every 60s)
  const { startScheduler } = require('./utils/scheduler');
  startScheduler(60000);

  const env = process.env.NODE_ENV || 'development';
  console.log(`\n SAM Backend çalışıyor`);
  console.log(` Port    : http://localhost:${PORT}`);
  console.log(` Ortam   : ${env}`);
  if (env !== 'production') {
    console.log(` Frontend: http://localhost:3000 (Vite proxy aktif)`);
  } else {
    console.log(` Frontend: http://localhost:${PORT} (Express static)`);
  }
  console.log('');
});