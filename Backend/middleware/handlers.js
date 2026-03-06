const logger = require("../utils/logger");

// 404 handler
function notFound(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Global error handler
function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message
  });
}

module.exports = { notFound, errorHandler };
