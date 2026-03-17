require('dotenv').config();
const { sequelize } = require('../models');

(async () => {
  try {
    const [tables] = await sequelize.query('SHOW TABLES');
    const tableNames = tables.map(r => Object.values(r)[0]);
    
    let totalDropped = 0;
    for (const table of tableNames) {
      const [indexes] = await sequelize.query(`SHOW INDEX FROM \`${table}\``);
      const names = [...new Set(indexes.map(i => i.Key_name))];
      // _2, _3 ... gibi duplicate indexleri bul
      const dupes = names.filter(n => /_\d+$/.test(n));
      for (const name of dupes) {
        await sequelize.query(`DROP INDEX \`${name}\` ON \`${table}\``);
        totalDropped++;
      }
      if (dupes.length > 0) {
        console.log(`${table}: ${dupes.length} duplicate index silindi`);
      }
    }
    console.log(`\nToplam ${totalDropped} duplicate index temizlendi.`);
  } catch (err) {
    console.error('Hata:', err.message);
  } finally {
    await sequelize.close();
  }
})();
