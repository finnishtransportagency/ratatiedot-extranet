-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "categoryId" TEXT,
    "alfrescoId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "action" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "activityId" INTEGER NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Activity_activityId_key" ON "Activity"("activityId");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryDataBase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
