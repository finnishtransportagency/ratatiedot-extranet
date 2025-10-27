-- RemoveBucketId
-- Remove unused bucketId fields from Balise and BaliseVersion tables

-- AlterTable
ALTER TABLE "Balise" DROP COLUMN "bucketId";

-- AlterTable  
ALTER TABLE "BaliseVersion" DROP COLUMN "bucketId";
