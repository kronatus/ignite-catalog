#!/usr/bin/env node

/**
 * This script runs Prisma migrations and then ingests the Re:Invent data
 * Run this after deployment or locally with: node scripts/run-migrations.js
 */

const { execSync } = require("child_process");

async function runMigrations() {
  try {
    console.log("Starting migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("✅ Migrations completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

runMigrations();
