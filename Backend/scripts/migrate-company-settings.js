#!/usr/bin/env node
const sequelize = require("../config/database");
const { CompanySetting } = require("../models");

async function migrateCompanySettings() {
  try {
    console.log('[Migration] Starting CompanySetting migration...');
    
    // Sync the model with database (will add missing columns)
    await CompanySetting.sync({ alter: true });
    
    console.log('[Migration] ✓ CompanySetting table updated successfully');
    console.log('[Migration] Columns synced:');
    console.log('  - profile_data');
    console.log('  - folders_data');
    
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('[Migration] ✗ Error:', err.message);
    await sequelize.close();
    process.exit(1);
  }
}

migrateCompanySettings();
