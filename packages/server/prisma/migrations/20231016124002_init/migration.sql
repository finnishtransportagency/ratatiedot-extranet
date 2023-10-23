/*
  Warnings:

  - A unique constraint covering the columns `[alfrescoId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Activity_alfrescoId_key" ON "Activity"("alfrescoId");
