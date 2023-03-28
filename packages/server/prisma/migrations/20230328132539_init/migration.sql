/*
  Warnings:

  - A unique constraint covering the columns `[alfrescoFolder]` on the table `CategoryDataBase` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CategoryDataBase_alfrescoFolder_key" ON "CategoryDataBase"("alfrescoFolder");
