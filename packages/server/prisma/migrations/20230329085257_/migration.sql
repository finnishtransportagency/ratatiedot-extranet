/*
  Warnings:

  - The primary key for the `CategoryDataBase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `CategoryDataContents` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[alfrescoFolder]` on the table `CategoryDataBase` will be added. If there are existing duplicate values, this will fail.

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
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "CategoryComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "alfrescoNodeId" TEXT NOT NULL,
    "categoryComponentId" TEXT NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "categoryComponentId" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Node_categoryComponentId_key" ON "Node"("categoryComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "Card_categoryComponentId_key" ON "Card"("categoryComponentId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryDataBase_alfrescoFolder_key" ON "CategoryDataBase"("alfrescoFolder");

-- AddForeignKey
ALTER TABLE "CategoryDataContents" ADD CONSTRAINT "CategoryDataContents_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "CategoryDataBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryComponent" ADD CONSTRAINT "CategoryComponent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryDataBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_categoryComponentId_fkey" FOREIGN KEY ("categoryComponentId") REFERENCES "CategoryComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_categoryComponentId_fkey" FOREIGN KEY ("categoryComponentId") REFERENCES "CategoryComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
