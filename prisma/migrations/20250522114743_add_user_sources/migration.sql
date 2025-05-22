-- AlterTable
ALTER TABLE "Source" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "ownerId" INTEGER;

-- AddForeignKey
ALTER TABLE "Source" ADD CONSTRAINT "Source_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
