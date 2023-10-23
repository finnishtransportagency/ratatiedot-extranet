-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "alfrescoId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryDataBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
