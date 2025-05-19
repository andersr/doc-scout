-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "chatId" INTEGER;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
