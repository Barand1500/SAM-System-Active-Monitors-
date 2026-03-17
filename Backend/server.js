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