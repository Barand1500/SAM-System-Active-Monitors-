const { Sequelize } = require('sequelize');
require('dotenv').config();
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'sam_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci'
    },
    pool: {
      max: 20,        // İncreased for better concurrency
      min: 2,         // Keep minimum connections
      acquire: 30000, // 30s timeout for acquiring connection
      idle: 10000     // 10s idle timeout
    }
  }
);

// Veritabanı bağlantısını test et
sequelize.authenticate()
  .then(() => logger.info('Veritabanı bağlantısı başarılı'))
  .catch(err => logger.error('Veritabanı bağlantı hatası:', err.message));

module.exports = sequelize;
