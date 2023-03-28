/*
  Warnings:

  - A unique constraint covering the columns `[categoryComponentId]` on the table `Card` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[categoryComponentId]` on the table `NodeList` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Card_categoryComponentId_key" ON "Card"("categoryComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "NodeList_categoryComponentId_key" ON "NodeList"("categoryComponentId");
