/*
  Warnings:

  - You are about to drop the `Area` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Balise" ADD COLUMN     "lockReason" TEXT;

-- DropTable
DROP TABLE "Area";
