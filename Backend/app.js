const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();
const logger = require('./utils/logger');

const app = express();

// ─── Environment Validation ──────────────────────────────────────────────────
const requiredEnvVars = ['JWT_SECRET', 'DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(env => !process.env[env]);
if (missingEnvVars.length > 0) {
  logger.error('CRITICAL: Missing environment variables:', missingEnvVars.join(', '));
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

// ─── Güvenlik ───────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false,
}));

// ─── CORS (Development ve Production handling) ──────────────────────────────
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : process.env.NODE_ENV === 'production'
    ? ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:5000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS rejected:', origin);
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── Body parsers ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── CORS Headers for Static Files ───────────────────────────────────────────
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ─── Uploads klasörü (yüklenen dosyalar) ─────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ──────────────────────────────────────────────────────────────
const routes = require('./routes/index');  // ← routes hazır olunca aç
app.use('/api', routes);

// ─── Error Handlers ──────────────────────────────────────────────────────────
const { notFound, errorHandler } = require('./middleware/handlers');

// ─── Production: Frontend build dosyalarını sun ───────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));

  // React SPA — tüm bilinmeyen route'lar index.html'e gitsin
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// ─── 404 & Global Error Handler ──────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
