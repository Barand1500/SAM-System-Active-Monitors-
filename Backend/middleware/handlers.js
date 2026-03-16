const logger = require("../utils/logger");

// 404 handler
function notFound(req, res, next) {
  res.status(404).json({
    code: "ROUTE_NOT_FOUND",
    error: "İstenen sayfa veya API adresi bulunamadı."
  });
}

// Global error handler
function errorHandler(err, req, res, next) {
  logger.error(err.message, { 
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip
  });

  const statusCode = err.statusCode || err.status || 500;
  const isDev = process.env.NODE_ENV !== "production";

  let friendlyMessage = "İşlem sırasında beklenmeyen bir hata oluştu.";
  if (statusCode === 400) friendlyMessage = "Gönderilen bilgiler geçersiz.";
  if (statusCode === 401) friendlyMessage = "Bu işlem için giriş yapmanız gerekiyor.";
  if (statusCode === 403) friendlyMessage = "Bu işlemi yapma yetkiniz yok.";
  if (statusCode === 404) friendlyMessage = "İstenen kayıt bulunamadı.";
  
  res.status(statusCode).json({
    error: isDev ? (err.message || friendlyMessage) : friendlyMessage,
    ...(isDev && { stack: err.stack })
  });
}

module.exports = { notFound, errorHandler };
