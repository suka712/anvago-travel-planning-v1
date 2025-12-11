# Prisma 7 Setup Issue & Solution

## Problem

Prisma 7 requires explicit adapter configuration for `PrismaClient`, which is causing initialization errors.

## Current Status

✅ **Database migration works** - `npx prisma migrate dev` succeeds  
✅ **Seed script works** - Using `seed-simple.ts` with raw SQL  
❌ **PrismaClient initialization fails** - Needs adapter configuration

## Quick Fix Options

### Option 1: Use Prisma 6 (Recommended for now)

Downgrade to Prisma 6 which is more stable:

```bash
cd backend
npm install prisma@6 @prisma/client@6 --save-exact
npx prisma generate
```

Then update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

And remove the `datasource` block from `prisma.config.ts`.

### Option 2: Wait for Prisma 7 Documentation

Prisma 7 is very new and documentation for adapter configuration may be incomplete. Check:
- https://pris.ly/d/config-datasource
- https://pris.ly/d/prisma7-client-config

### Option 3: Use Raw SQL Temporarily

The seed script (`seed-simple.ts`) works with raw SQL. You could create a database service layer using `pg` Pool directly until Prisma 7 adapter support is clearer.

## Current Working Setup

- ✅ Database: Created and migrated
- ✅ Seed: `npm run seed` works (uses raw SQL)
- ❌ App: PrismaClient needs adapter fix

## Next Steps

1. **For immediate development**: Use Option 1 (downgrade to Prisma 6)
2. **For production**: Wait for Prisma 7 adapter documentation or use raw SQL queries

## Seed Script

The seed script (`prisma/seed-simple.ts`) works and seeds 5 sample locations. To add more locations, edit that file.

