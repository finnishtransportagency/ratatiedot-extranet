/*
  Warnings:

  - Made the column `hasClassifiedContent` on table `CategoryDataBase` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CategoryDataBase" ALTER COLUMN "hasClassifiedContent" SET NOT NULL;
