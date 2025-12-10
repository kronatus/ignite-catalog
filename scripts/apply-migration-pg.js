const fs = require('fs');
const { Client } = require('pg');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL not set in environment.');
    process.exit(1);
  }

  const migrationPath = './prisma/migrations/20251210_add_event_source/migration.sql';
  if (!fs.existsSync(migrationPath)) {
    console.error('Migration SQL not found at', migrationPath);
    process.exit(1);
  }

  const sql = fs.readFileSync(migrationPath, 'utf8');

  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    console.log('Connected to database. Executing migration SQL...');
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migration SQL executed successfully.');
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (e) {
      // ignore
    }
    console.error('Failed to execute migration SQL:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
