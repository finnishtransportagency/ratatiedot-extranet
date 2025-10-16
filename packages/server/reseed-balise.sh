#!/bin/bash

# Script to reseed Balise and Area data
# This will delete existing balise and area data and create new seed data
#
# Usage: ./reseed-balise.sh
#
# The script will:
# 1. Check if migrations are up to date
# 2. Delete existing Balise and Area data
# 3. Seed 63 new areas (area 10-72)
# 4. Seed balises (100-600 per area, random distribution)
#
# Note: Uses DATABASE_URL from your .env file or environment

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Checking database connection...${NC}"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠️  DATABASE_URL not set in environment${NC}"
  echo -e "${BLUE}Loading from .env file if it exists...${NC}"
  if [ -f .env ]; then
    export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
  else
    echo -e "${YELLOW}⚠️  No .env file found. Please set DATABASE_URL environment variable.${NC}"
    echo -e "${BLUE}Example: export DATABASE_URL=\"postgresql://user:password@localhost:5433/rataextra?schema=public\"${NC}"
    exit 1
  fi
fi

echo -e "${BLUE}📊 Checking migration status...${NC}"
npx prisma migrate status || {
  echo -e "${YELLOW}⚠️  Migrations are not up to date. Running migrations...${NC}"
  npx prisma migrate deploy
}

echo ""
echo -e "${YELLOW}🗑️  Deleting existing Balise and Area data...${NC}"
npx prisma db execute --stdin << 'EOF'
DELETE FROM "BaliseVersion";
DELETE FROM "Balise";
DELETE FROM "Area";
EOF

echo ""
echo -e "${GREEN}🌱 Seeding new Area and Balise data...${NC}"
echo -e "${BLUE}This will create:${NC}"
echo -e "  - 63 areas (area 10 through area 72)"
echo -e "  - 100-600 balises per area (random)"
echo -e "  - Version history for balises with multiple versions"
echo ""
npx prisma db seed

echo ""
echo -e "${GREEN}✅ Data reseeded successfully!${NC}"
echo ""
echo -e "${BLUE}📈 Summary:${NC}"
npx prisma db execute --stdin << 'EOF'
SELECT 
  (SELECT COUNT(*) FROM "Area") as areas,
  (SELECT COUNT(*) FROM "Balise") as balises,
  (SELECT COUNT(*) FROM "BaliseVersion") as balise_versions;
EOF

echo ""
echo -e "${GREEN}🎉 Done! You can now test the application with fresh data.${NC}"
