/*
  Warnings:

  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Test";

-- CreateTable
CREATE TABLE "CategoryDataBase" (
    "id" SERIAL NOT NULL,
    "rataextraRequestPage" TEXT NOT NULL,
    "alfrescoFolder" TEXT NOT NULL,
    "writeRights" TEXT NOT NULL,

    CONSTRAINT "CategoryDataBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryDataContents" (
    "id" SERIAL NOT NULL,
    "baseId" INTEGER NOT NULL,
    "fields" JSONB NOT NULL,

    CONSTRAINT "CategoryDataContents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryDataContents_baseId_key" ON "CategoryDataContents"("baseId");

-- AddForeignKey
ALTER TABLE "CategoryDataContents" ADD CONSTRAINT "CategoryDataContents_baseId_fkey" FOREIGN KEY ("baseId") REFERENCES "CategoryDataBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
