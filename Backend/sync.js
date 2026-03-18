/**
 * Database Sync Script
 * Tüm Sequelize modellerini veritabanına senkronize eder.
 * 
 * Kullanım:
 *   node sync.js          → Tablo yoksa oluşturur (güvenli)
 *   node sync.js --force   → Tüm tabloları silip yeniden oluşturur (DİKKAT!)
 *   node sync.js --alter   → Mevcut tabloları günceller (kolon ekle/çıkar)
 */
require("dotenv").config();
const { sequelize } = require("./models");

const args = process.argv.slice(2);
const force = args.includes("--force");
const alter = args.includes("--alter");

async function syncDatabase() {
  try {
    // Bağlantı testi
    await sequelize.authenticate();
    console.log("✅ Veritabanı bağlantısı başarılı.");

    // Sync options
    const options = {};
    if (force) {
      options.force = true;
      console.log("⚠️  FORCE modu: Tüm tablolar silinip yeniden oluşturulacak!");
    } else if (alter) {
      options.alter = true;
      console.log("🔄 ALTER modu: Mevcut tablolar güncellenecek.");
    } else {
      console.log("📦 SAFE modu: Sadece yeni tablolar oluşturulacak.");
    }

    // FK constraint uyumsuzluklarını çözmek için sync öncesi FK kontrolünü kapat
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    await sequelize.sync(options);
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    console.log("✅ Tüm tablolar senkronize edildi.");

    // Tablo listesini göster
    const [results] = await sequelize.query("SHOW TABLES");
    console.log(`\n📋 Toplam ${results.length} tablo:`);
    results.forEach((row) => {
      const tableName = Object.values(row)[0];
      console.log(`   - ${tableName}`);
    });

    console.log("\n✅ Sync tamamlandı.");
  } catch (err) {
    console.error("❌ Sync hatası:", err.message);
    if (err.original) {
      console.error("   Detay:", err.original.message);
    }
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

syncDatabase();