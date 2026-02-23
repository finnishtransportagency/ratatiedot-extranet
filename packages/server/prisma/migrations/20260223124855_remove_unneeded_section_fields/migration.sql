/*
  Warnings:

  - You are about to drop the column `color` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `shortName` on the `Section` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Section" DROP COLUMN "color",
DROP COLUMN "shortName";
