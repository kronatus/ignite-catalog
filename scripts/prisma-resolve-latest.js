const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Only run this helper when PRISMA_AUTO_RESOLVE is explicitly enabled.
// This prevents unexpected migration resolution in normal builds.
if (process.env.PRISMA_AUTO_RESOLVE !== 'true') {
  console.log('PRISMA_AUTO_RESOLVE not set to "true"; skipping prisma migrate resolve.');
  process.exit(0);
}

try {
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    console.log('No migrations directory found; skipping prisma migrate resolve.');
    process.exit(0);
  }

  const entries = fs.readdirSync(migrationsDir).filter((f) => {
    try {
      return fs.statSync(path.join(migrationsDir, f)).isDirectory();
    } catch (e) {
      return false;
    }
  });

  if (!entries || entries.length === 0) {
    console.log('No migrations found; skipping prisma migrate resolve.');
    process.exit(0);
  }

  // Sort by name and pick the last one (newest)
  entries.sort();
  const latest = entries[entries.length - 1];

  console.log('Attempting to mark latest migration as applied (if needed):', latest);

  try {
    execSync(`npx prisma migrate resolve --applied "${latest}"`, { stdio: 'inherit' });
    console.log('prisma migrate resolve completed (or was unnecessary).');
  } catch (err) {
    console.warn('prisma migrate resolve returned an error (continuing):', err.message);
  }
} catch (err) {
  console.warn('Error while trying to resolve migration:', err.message);
}
process.exit(0);
