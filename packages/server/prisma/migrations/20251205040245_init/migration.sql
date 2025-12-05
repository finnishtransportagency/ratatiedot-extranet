-- CreateTable
CREATE TABLE "BaliseArchive" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "originalSecondaryId" INTEGER NOT NULL,
    "archivedSecondaryId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "fileTypes" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "lockedBy" TEXT,
    "lockedTime" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedBy" TEXT NOT NULL,

    CONSTRAINT "BaliseArchive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaliseArchiveVersion" (
    "id" TEXT NOT NULL,
    "baliseArchiveId" TEXT NOT NULL,
    "originalVersionId" TEXT NOT NULL,
    "originalSecondaryId" INTEGER NOT NULL,
    "archivedSecondaryId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "fileTypes" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "lockedBy" TEXT,
    "lockedTime" TIMESTAMP(3),
    "versionCreatedTime" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BaliseArchiveVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BaliseArchive_originalId_key" ON "BaliseArchive"("originalId");

-- CreateIndex
CREATE UNIQUE INDEX "BaliseArchive_archivedSecondaryId_key" ON "BaliseArchive"("archivedSecondaryId");

-- CreateIndex
CREATE INDEX "BaliseArchive_originalSecondaryId_idx" ON "BaliseArchive"("originalSecondaryId");

-- CreateIndex
CREATE INDEX "BaliseArchive_archivedSecondaryId_idx" ON "BaliseArchive"("archivedSecondaryId");

-- CreateIndex
CREATE INDEX "BaliseArchive_archivedAt_idx" ON "BaliseArchive"("archivedAt");

-- CreateIndex
CREATE INDEX "BaliseArchive_originalId_idx" ON "BaliseArchive"("originalId");

-- CreateIndex
CREATE UNIQUE INDEX "BaliseArchiveVersion_originalVersionId_key" ON "BaliseArchiveVersion"("originalVersionId");

-- CreateIndex
CREATE INDEX "BaliseArchiveVersion_baliseArchiveId_version_idx" ON "BaliseArchiveVersion"("baliseArchiveId", "version");

-- CreateIndex
CREATE INDEX "BaliseArchiveVersion_originalSecondaryId_version_idx" ON "BaliseArchiveVersion"("originalSecondaryId", "version");

-- CreateIndex
CREATE INDEX "BaliseArchiveVersion_archivedSecondaryId_version_idx" ON "BaliseArchiveVersion"("archivedSecondaryId", "version");

-- AddForeignKey
ALTER TABLE "BaliseArchiveVersion" ADD CONSTRAINT "BaliseArchiveVersion_baliseArchiveId_fkey" FOREIGN KEY ("baliseArchiveId") REFERENCES "BaliseArchive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
