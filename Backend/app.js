import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ─── Güvenlik ───────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // React SPA için kapatıldı, ileride özelleştir
}));

// ─── CORS (sadece development'ta gerekli, prod'da same-origin) ───────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  }));
}

// ─── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Uploads klasörü (yüklenen dosyalar) ─────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ──────────────────────────────────────────────────────────────
// import routes from './routes/index.js';  // ← routes hazır olunca aç
// app.use('/api', routes);

// ─── Production: Frontend build dosyalarını sun ───────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));

  // React SPA — tüm bilinmeyen route'lar index.html'e gitsin
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

export default app;
