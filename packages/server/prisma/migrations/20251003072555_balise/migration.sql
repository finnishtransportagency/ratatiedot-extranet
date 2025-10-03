-- CreateTable
CREATE TABLE "Balise" (
    "id" TEXT NOT NULL,
    "secondaryId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "bucketId" TEXT NOT NULL,
    "fileTypes" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "lockedBy" TEXT,
    "lockedTime" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,

    CONSTRAINT "Balise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaliseVersion" (
    "id" TEXT NOT NULL,
    "baliseId" TEXT NOT NULL,
    "secondaryId" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "bucketId" TEXT NOT NULL,
    "fileTypes" TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL,
    "locked" BOOLEAN NOT NULL,
    "lockedBy" TEXT,
    "lockedTime" TIMESTAMP(3),
    "versionCreatedTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BaliseVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "idRangeMin" INTEGER NOT NULL,
    "idRangeMax" INTEGER NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedTime" TIMESTAMP(3),

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Balise_secondaryId_key" ON "Balise"("secondaryId");

-- CreateIndex
CREATE INDEX "BaliseVersion_baliseId_version_idx" ON "BaliseVersion"("baliseId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Area_key_key" ON "Area"("key");

-- CreateIndex
CREATE INDEX "Area_idRangeMin_idRangeMax_idx" ON "Area"("idRangeMin", "idRangeMax");

-- AddForeignKey
ALTER TABLE "BaliseVersion" ADD CONSTRAINT "BaliseVersion_baliseId_fkey" FOREIGN KEY ("baliseId") REFERENCES "Balise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
