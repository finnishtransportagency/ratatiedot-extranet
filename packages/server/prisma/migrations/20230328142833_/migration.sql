/*
  Warnings:

  - A unique constraint covering the columns `[categoryId]` on the table `CategoryComponent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `CategoryComponent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CategoryComponent" DROP CONSTRAINT "CategoryComponent_id_fkey";

-- AlterTable
ALTER TABLE "CategoryComponent" ADD COLUMN     "categoryId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CategoryComponent_categoryId_key" ON "CategoryComponent"("categoryId");

-- AddForeignKey
ALTER TABLE "CategoryComponent" ADD CONSTRAINT "CategoryComponent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryDataBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
