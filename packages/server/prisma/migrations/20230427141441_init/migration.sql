-- CreateTable
CREATE TABLE "FavoriteCategory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "FavoriteCategory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FavoriteCategory" ADD CONSTRAINT "FavoriteCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "CategoryDataBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
