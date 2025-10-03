/*
  Warnings:

  - Added the required column `description` to the `Balise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `BaliseVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Balise" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BaliseVersion" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "fileTypes" TEXT[];
