/*
  Warnings:

  - Made the column `categoryComponentId` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Made the column `categoryComponentId` on table `Node` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_categoryComponentId_fkey";

-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_categoryComponentId_fkey";

-- DropIndex
DROP INDEX "CategoryComponent_categoryId_key";

-- AlterTable
ALTER TABLE "Card" ALTER COLUMN "categoryComponentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Node" ALTER COLUMN "categoryComponentId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_categoryComponentId_fkey" FOREIGN KEY ("categoryComponentId") REFERENCES "CategoryComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_categoryComponentId_fkey" FOREIGN KEY ("categoryComponentId") REFERENCES "CategoryComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
