-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('OFFICIAL', 'UNCONFIRMED');

-- AlterTable
ALTER TABLE "Balise" ADD COLUMN     "lockedAtVersion" INTEGER,
ADD COLUMN     "versionStatus" "VersionStatus" NOT NULL DEFAULT 'OFFICIAL';

-- AlterTable
ALTER TABLE "BaliseArchive" ADD COLUMN     "lockedAtVersion" INTEGER,
ADD COLUMN     "versionStatus" "VersionStatus" NOT NULL DEFAULT 'OFFICIAL';

-- AlterTable
ALTER TABLE "BaliseArchiveVersion" ADD COLUMN     "versionStatus" "VersionStatus" NOT NULL DEFAULT 'OFFICIAL';

-- AlterTable
ALTER TABLE "BaliseVersion" ADD COLUMN     "versionStatus" "VersionStatus" NOT NULL DEFAULT 'OFFICIAL';
