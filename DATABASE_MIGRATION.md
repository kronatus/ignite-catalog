# Database Migration Guide: SQLite to PostgreSQL

This guide will help you migrate from SQLite to PostgreSQL for Vercel deployment.

## Why PostgreSQL?

Vercel's serverless environment doesn't support SQLite file-based databases because:
- The file system is read-only (except `/tmp`)
- Each serverless function has an isolated file system
- Files don't persist between deployments

PostgreSQL is a cloud-native database that works perfectly with Vercel.

## Step 1: Choose a PostgreSQL Provider

You have several options:

### Option A: Vercel Postgres (Recommended - Easiest)
1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database** → Select **Postgres**
4. Copy the connection string (it will be automatically set as `DATABASE_URL`)

### Option B: Neon (Recommended - Free Tier)
1. Go to https://neon.tech
2. Sign up/login and create a new project
3. Copy the connection string from the dashboard
4. Format: `postgresql://user:password@host/database?sslmode=require`

### Option C: Supabase (Recommended - Free Tier)
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string from "Connection string" section

### Option D: Other Providers
- Railway.app
- Render.com
- AWS RDS
- Google Cloud SQL
- Azure Database

## Step 2: Set Up Environment Variables

### For Local Development:
Create or update `.env` file in your project root:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/database_name?schema=public"
```

### For Vercel:
1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add/Update `DATABASE_URL` with your PostgreSQL connection string
4. Make sure to add it for **Production**, **Preview**, and **Development** environments

## Step 3: Run Database Migrations

After setting up your PostgreSQL database and `DATABASE_URL`:

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate

# Create initial migration (this will create all tables)
npx prisma migrate dev --name init_postgres

# For production (after deploying)
npx prisma migrate deploy
```

## Step 4: Seed Your Database (Optional)

If you had data in your SQLite database, you'll need to migrate it:

1. Export data from SQLite:
```bash
# You may need to write a script to export data
# Or use a tool like sqlite3 to export to SQL
```

2. Import to PostgreSQL:
```bash
# Use psql or your database client to import data
psql $DATABASE_URL < your_data.sql
```

Or use Prisma's seed functionality (create `prisma/seed.ts`)

## Step 5: Update Build Script (Already Done)

The build script in `package.json` is already configured correctly:
```json
"build": "prisma generate && next build"
```

Vercel will automatically run migrations if you add a `postinstall` script or use Prisma Migrate in your build process.

## Troubleshooting

### Connection Issues
- Make sure your `DATABASE_URL` uses `postgresql://` (not `postgres://`)
- Ensure SSL is enabled: add `?sslmode=require` to connection string
- Check firewall settings on your database provider

### Migration Issues
- Make sure `DATABASE_URL` is set correctly
- Run `npx prisma migrate reset` to start fresh (⚠️ deletes all data)
- Check Prisma migration status: `npx prisma migrate status`

### Local Development
- Install PostgreSQL locally or use Docker:
  ```bash
  docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
  ```

## Next Steps

1. ✅ Schema updated to PostgreSQL
2. ✅ Dependencies updated (removed `better-sqlite3`, added `pg`)
3. ⏳ Set up PostgreSQL database (choose a provider above)
4. ⏳ Set `DATABASE_URL` environment variable
5. ⏳ Run migrations: `npx prisma migrate dev`
6. ⏳ Test locally
7. ⏳ Deploy to Vercel

## Need Help?

- Prisma Docs: https://www.prisma.io/docs/guides/migrate-to-postgresql
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
- Neon Docs: https://neon.tech/docs

