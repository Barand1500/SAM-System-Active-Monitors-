const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middleware/authMiddleware");

// 🔥 GİZLİ RESTART ENDPOİNT - Sadece boss kullanabilir
router.post("/restart", authenticate, authorizeRoles("boss"), (req, res) => {
  console.log('🔄 Server restart triggered by:', req.user.email || req.user.id);
  
  res.json({ 
    success: true,
    message: 'Server yeniden başlatılıyor... 5 saniye bekleyin.' 
  });
  
  // 1 saniye sonra process'i kapat - PM2 otomatik restart yapar
  setTimeout(() => {
    console.log('🔄 Process exiting for restart...');
    process.exit(0);
  }, 1000);
});

// 🔐 SÜPER GİZLİ TOKEN RESTART - Konsol erişimi yoksa kullan
// Tarayıcı console'dan: fetch('/api/system/emergency-restart/guzelteknoloji2026', {method:'POST'})
router.post("/emergency-restart/:token", (req, res) => {
  const SECRET_TOKEN = process.env.RESTART_TOKEN || "guzelteknoloji2026";
  
  if (req.params.token === SECRET_TOKEN) {
    console.log('🚨 EMERGENCY RESTART triggered from IP:', req.ip);
    
    res.json({ 
      success: true,
      message: '🔄 Emergency restart başlatıldı!' 
    });
    
    setTimeout(() => {
      process.exit(0);
    }, 500);
  } else {
    res.status(403).json({ 
      success: false,
      error: 'Geçersiz token' 
    });
  }
});

// 📊 Server durumu kontrol
router.get("/health", (req, res) => {
  res.json({
    status: 'online',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0',
    timestamp: new Date()
  });
});

module.exports = router;
