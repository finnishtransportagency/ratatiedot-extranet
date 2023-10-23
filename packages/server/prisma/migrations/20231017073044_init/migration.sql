/*
  Warnings:

  - A unique constraint covering the columns `[activityId]` on the table `Activity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `activityId` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "activityId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Activity_activityId_key" ON "Activity"("activityId");
