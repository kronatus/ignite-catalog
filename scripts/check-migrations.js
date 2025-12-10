#!/usr/bin/env node
const { PrismaClient } = require("@prisma/client");

async function checkMigrations() {
  const prisma = new PrismaClient();
  try {
    // Query the _prisma_migrations table directly
    const migrations = await prisma.$queryRaw`
      SELECT id, checksum, finished_at, execution_time, logs, rolled_back_at, started_at, applied_at_with_precision
      FROM "_prisma_migrations"
      ORDER BY started_at DESC;
    `;
    console.log("Migrations in database:");
    console.log(JSON.stringify(migrations, null, 2));

    // Also check if eventSource column exists
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Session'
      ORDER BY column_name;
    `;
    console.log("\nSession table columns:");
    console.log(JSON.stringify(columns, null, 2));
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigrations();
