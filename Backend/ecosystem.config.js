module.exports = {
  apps: [{
    name: 'sam-backend',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    
    // 🔥 OTOMATİK YENİDEN BAŞLATMA
    watch: true,
    
    // İzlenecek klasörler
    watch_options: {
      followSymlinks: false,
      usePolling: false,
      interval: 1000
    },
    
    // İzlenmeyecek klasörler (performans için)
    ignore_watch: [
      'node_modules',
      'logs',
      'uploads',
      'public',
      '.git',
      '*.log'
    ],
    
    // Ortam değişkenleri
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    
    // Log ayarları
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    
    // Restart limitleri (sonsuz restart engellemek için)
    max_restarts: 10,
    min_uptime: '10s',
    
    // Crash durumunda otomatik restart
    autorestart: true
  }]
};
