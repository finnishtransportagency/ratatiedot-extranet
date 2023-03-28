/*
  Warnings:

  - The primary key for the `CategoryDataBase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CategoryDataContents` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "CategoryDataContents" DROP CONSTRAINT "CategoryDataContents_baseId_fkey";

-- AlterTable
ALTER TABLE "CategoryDataBase" DROP CONSTRAINT "CategoryDataBase_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "CategoryDataBase_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CategoryDataBase_id_seq";

-- AlterTable
ALTER TABLE "CategoryDataContents" DROP CONSTRAINT "CategoryDataContents_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "baseId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CategoryDataContents_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CategoryDataContents_id_seq";

-- CreateTable
CREATE TABLE "CategoryComponent" (
    "id" TEXT NOT NULL,

    CONSTRAINT "CategoryComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NodeList" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "categoryComponentId" TEXT,

    CONSTRAINT "NodeList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "categoryComponentId" TEXT,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CategoryDataContents" ADD CONSTRAINT "CategoryDataContents_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "CategoryDataBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryComponent" ADD CONSTRAINT "CategoryComponent_id_fkey" FOREIGN KEY ("id") REFERENCES "CategoryDataBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NodeList" ADD CONSTRAINT "NodeList_categoryComponentId_fkey" FOREIGN KEY ("categoryComponentId") REFERENCES "CategoryComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_categoryComponentId_fkey" FOREIGN KEY ("categoryComponentId") REFERENCES "CategoryComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
