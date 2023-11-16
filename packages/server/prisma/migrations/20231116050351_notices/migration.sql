-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL,
    "publishTimeStart" TIMESTAMP(3) NOT NULL,
    "publishTimeEnd" TIMESTAMP(3),
    "showAsBanner" BOOLEAN NOT NULL,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);
