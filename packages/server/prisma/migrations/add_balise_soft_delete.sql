/*
  Add soft delete fields to Balise model
  
  Run this migration with:
  npx prisma migrate dev --name add-balise-soft-delete
*/

-- Add soft delete fields to Balise table
ALTER TABLE "Balise" ADD COLUMN "deletedAt" TIMESTAMP(3);
ALTER TABLE "Balise" ADD COLUMN "deletedBy" TEXT;
