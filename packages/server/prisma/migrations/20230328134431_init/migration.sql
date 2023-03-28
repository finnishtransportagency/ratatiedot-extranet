/*
  Warnings:

  - You are about to drop the `NodeList` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "NodeList" DROP CONSTRAINT "NodeList_categoryComponentId_fkey";

-- DropTable
DROP TABLE "NodeList";

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "categoryComponentId" TEXT,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Node_categoryComponentId_key" ON "Node"("categoryComponentId");

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_categoryComponentId_fkey" FOREIGN KEY ("categoryComponentId") REFERENCES "CategoryComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
