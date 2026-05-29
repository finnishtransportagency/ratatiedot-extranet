/*
  Warnings:

  - You are about to drop the column `idRangeMax` on the `Section` table. All the data in the column will be lost.
  - You are about to drop the column `idRangeMin` on the `Section` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sectionPrefix]` on the table `Section` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sectionPrefix` to the `Section` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Section_idRangeMin_idRangeMax_idx";

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "idRangeMax",
DROP COLUMN "idRangeMin",
ADD COLUMN     "sectionPrefix" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Section_sectionPrefix_key" ON "Section"("sectionPrefix");
