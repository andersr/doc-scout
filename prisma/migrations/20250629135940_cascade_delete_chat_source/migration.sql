-- DropForeignKey
ALTER TABLE "ChatSource" DROP CONSTRAINT "ChatSource_sourceId_fkey";

-- AddForeignKey
ALTER TABLE "ChatSource" ADD CONSTRAINT "ChatSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
