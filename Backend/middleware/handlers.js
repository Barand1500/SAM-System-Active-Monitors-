const logger = require("../utils/logger");

// 404 handler
function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
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
  
  res.status(statusCode).json({
    error: isDev ? err.message : "An error occurred",
    ...(isDev && { stack: err.stack })
  });
}

module.exports = { notFound, errorHandler };
