/*
  Warnings:

  - A unique constraint covering the columns `[userId,categoryId]` on the table `FavoriteCategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FavoriteCategory_userId_categoryId_key" ON "FavoriteCategory"("userId", "categoryId");
