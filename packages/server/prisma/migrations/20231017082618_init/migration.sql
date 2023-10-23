-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_categoryId_fkey";

-- AlterTable
ALTER TABLE "Activity" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryDataBase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
