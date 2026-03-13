/**
 * Diagnostic script to find users with missing company_id
 * Run with: node scripts/diagnose-missing-company.js
 */

const sequelize = require("../config/database");
const { User, Company } = require("../models");

async function diagnose() {
  try {
    await sequelize.authenticate();
    console.log("✓ Database connected");

    // Find all users without a company
    const usersWithoutCompany = await User.findAll({
      where: { companyId: null },
      attributes: ["id", "email", "firstName", "lastName", "createdAt"]
    });

    if (usersWithoutCompany.length > 0) {
      console.error("\n❌ Found", usersWithoutCompany.length, "users without a company:");
      console.table(usersWithoutCompany.map(u => u.toJSON()));
      console.log("\n⚠️  These users will get 400 errors when calling /tasks/config");
      console.log("FIX: Assign them to a company or delete them\n");
    } else {
      console.log("✓ All users have a company assigned");
    }

    // Get total user count
    const totalUsers = await User.count();
    const usersWithCompany = totalUsers - usersWithoutCompany.length;
    console.log(`\nTotal users: ${totalUsers}`);
    console.log(`With company: ${usersWithCompany}`);
    console.log(`Without company: ${usersWithoutCompany.length}\n`);

    // List all companies
    const companies = await Company.findAll({
      attributes: ["id", "name", "company_code"],
      raw: true
    });
    console.log("Available companies:");
    console.table(companies);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await sequelize.close();
  }
}

diagnose();
