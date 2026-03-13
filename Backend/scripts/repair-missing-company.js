/**
 * Repair script to assign users to their first company
 * This is useful if users were created without a company ID
 * Run with: node scripts/repair-missing-company.js
 */

const sequelize = require("../config/database");
const { User, Company } = require("../models");

async function repair() {
  const transaction = await sequelize.transaction();
  try {
    await sequelize.authenticate();
    console.log("✓ Database connected");

    // Find all companies
    const companies = await Company.findAll();
    if (companies.length === 0) {
      console.error("❌ No companies exist in database. Create a company first.");
      return;
    }

    const defaultCompany = companies[0];
    console.log(`ℹ️  Using default company: ${defaultCompany.name} (ID: ${defaultCompany.id})`);

    // Find users without a company
    const usersWithoutCompany = await User.findAll({
      where: { companyId: null },
      transaction
    });

    if (usersWithoutCompany.length === 0) {
      console.log("✓ No users without a company. Nothing to repair.");
      await transaction.rollback();
      return;
    }

    console.log(`\nFound ${usersWithoutCompany.length} users without a company.`);
    console.log("Assigning them to: " + defaultCompany.name);

    // Update all users to have a company
    const result = await User.update(
      { companyId: defaultCompany.id },
      { where: { companyId: null }, transaction }
    );

    await transaction.commit();
    console.log(`✓ Updated ${result[0]} users`);
    console.log("✓ Repair complete. Users can now login.\n");

  } catch (err) {
    await transaction.rollback();
    console.error("❌ Error:", err.message);
  } finally {
    await sequelize.close();
  }
}

repair();
