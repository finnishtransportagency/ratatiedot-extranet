-- CreateTable
CREATE TABLE "Balise" (
    "id" TEXT NOT NULL,
    "secondaryId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "bucketId" TEXT NOT NULL,
    "fileTypes" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "lockedBy" TEXT,
    "lockedTime" TIMESTAMP(3),

    CONSTRAINT "Balise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaliseVersion" (
    "id" TEXT NOT NULL,
    "baliseId" TEXT NOT NULL,
    "secondaryId" INTEGER NOT NULL,
    "bucketId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "lockedBy" TEXT,
    "lockedTime" TIMESTAMP(3),
    "versionCreatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BaliseVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Balise_secondaryId_key" ON "Balise"("secondaryId");

-- CreateIndex
CREATE INDEX "BaliseVersion_baliseId_version_idx" ON "BaliseVersion"("baliseId", "version");

-- AddForeignKey
ALTER TABLE "BaliseVersion" ADD CONSTRAINT "BaliseVersion_baliseId_fkey" FOREIGN KEY ("baliseId") REFERENCES "Balise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
