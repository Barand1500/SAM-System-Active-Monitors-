const http = require('http');
const { Server: SocketIO } = require('socket.io');
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;
const httpServer = http.createServer(app);

// ─── Socket.io ───────────────────────────────────────────────────────────────
const io = new SocketIO(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? false
      : (process.env.FRONTEND_URL || 'http://localhost:3000'),
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

// ─── Sunucuyu başlat ──────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
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
