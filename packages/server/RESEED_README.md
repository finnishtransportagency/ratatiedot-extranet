# Balise Data Reseeding Guide

## Overview

This guide explains how to reseed the Balise and Area data in your local database.

## What Gets Created

### Areas

- **63 areas** numbered from 10 to 72
- Each area covers 1000 balise IDs:
  - Area 10: IDs 10000-10999
  - Area 11: IDs 11000-11999
  - ...
  - Area 72: IDs 72000-72999

### Balises

- **100-600 balises per area** (random distribution)
- **Total: ~20,000-25,000 balises** across all areas
- Each balise has:
  - Short Finnish description (1-3 lines)
  - 1-4 versions with version history
  - Realistic filenames (e.g., `tiedot_1234.leu`, `config_5678.il`)
  - 15% chance of being locked
  - 10% created in last 24 hours (for testing recent data)

## Prerequisites

1. PostgreSQL database running
2. DATABASE_URL configured in `.env` file or environment
3. Prisma schema up to date

## Steps to Reseed

### Option 1: Using the Script (Recommended)

```bash
cd packages/server/prisma
./reseed-balises.sh
```

The script will:

1. Check if DATABASE_URL is set (from .env or environment)
2. Check migration status and run migrations if needed
3. Delete existing Balise and Area data
4. Create 63 new areas
5. Create balises with realistic Finnish data
6. Show a summary of created records

### Option 2: Manual Commands

```bash
cd packages/server

# Make sure DATABASE_URL is set (check your .env file)
# Or export it manually:
# export DATABASE_URL="postgresql://user:password@localhost:5433/rataextra?schema=public"

# Check migrations
npx prisma migrate status

# Run migrations if needed
npx prisma migrate deploy

# Delete existing data
npx prisma db execute --stdin <<'EOF'
DELETE FROM "BaliseVersion";
DELETE FROM "Balise";
DELETE FROM "Area";
EOF

# Seed new data
npx prisma db seed

# Check results
npx prisma db execute --stdin <<'EOF'
SELECT
  (SELECT COUNT(*) FROM "Area") as areas,
  (SELECT COUNT(*) FROM "Balise") as balises,
  (SELECT COUNT(*) FROM "BaliseVersion") as balise_versions;
EOF
```

## Seed Data Characteristics

### Finnish Descriptions

Short, realistic descriptions like:

- "Baliisi sijaitsee pääradan varrella km 234."
- "Asennettu vuonna 2019. Toimii osana ERTMS-järjestelmää."
- "Vaihtoalueen reunalla. Kriittinen osa junaliikenteen ohjausta."

### Filenames

Realistic Finnish-style filenames:

- `tiedot_1234.leu`
- `data_5678.il`
- `config_9012.bis`
- `info_3456.leu`
- `params_7890.il`

### Version History

- Each balise has 1-4 versions
- Older versions are stored in `BaliseVersion` table
- Current version is in `Balise` table
- Each version has its own set of files and description

## Troubleshooting

### Script Not Executable

```bash
chmod +x reseed-balise.sh
```

### DATABASE_URL Not Set

The script looks for DATABASE_URL in:

1. Environment variables
2. `.env` file in the current directory

Make sure you have a `.env` file with:

```
DATABASE_URL="postgresql://user:password@localhost:5433/rataextra?schema=public"
```

Or export it manually:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5433/rataextra?schema=public"
./reseed-balise.sh
```

### Database Connection Issues

Check that:

- PostgreSQL is running
- Database exists
- Credentials in DATABASE_URL are correct
- Port is accessible

### Migration Issues

If migrations fail:

```bash
npx prisma migrate reset --force
npx prisma migrate deploy
```

## Expected Output

```
🔍 Checking database connection on port 5433...
📊 Checking migration status...
Prisma schema loaded from prisma/schema.prisma

Database schema is up to date!

🗑️  Deleting existing Balise and Area data...

🌱 Seeding new Area and Balise data...
  - 63 areas (area 10 through area 72)
  - 100-600 balises per area (random)
  - Version history for balises with multiple versions

🌱 Seeding railway areas...
✅ Created 63 railway areas (area 10 - area 72)
🌱 Seeding balises for testing...
Creating ~22000 balises across 63 areas...
✅ Created balise batch 1/220
...
🎉 Balise seeding complete! Created 22143 balises with 18234 version records

✅ Data reseeded successfully!

📈 Summary:
 areas | balises | balise_versions
-------+---------+-----------------
    63 |   22143 |           18234

🎉 Done! You can now test the application with fresh data.
```

## Next Steps

After reseeding:

1. Restart your backend server
2. Refresh the frontend
3. Navigate to the Balise page
4. You should see the new areas and balises with Finnish descriptions
