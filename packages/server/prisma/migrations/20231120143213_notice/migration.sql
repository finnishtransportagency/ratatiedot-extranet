-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" JSONB NOT NULL,
    "authorId" TEXT,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishTimeStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishTimeEnd" TIMESTAMP(3),
    "showAsBanner" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);
