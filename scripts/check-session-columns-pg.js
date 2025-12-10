const { Client } = require('pg');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL not set in environment.');
    process.exit(1);
  }
  const client = new Client({ connectionString: databaseUrl });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Session'
      ORDER BY column_name;
    `);
    console.log('Session table columns:');
    console.table(res.rows);
  } catch (err) {
    console.error('Error querying database:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
