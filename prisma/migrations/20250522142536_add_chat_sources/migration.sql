-- CreateTable
CREATE TABLE "ChatSource" (
    "id" SERIAL NOT NULL,
    "sourceId" INTEGER,
    "chatId" INTEGER,

    CONSTRAINT "ChatSource_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ChatSource" ADD CONSTRAINT "ChatSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSource" ADD CONSTRAINT "ChatSource_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE SET NULL ON UPDATE CASCADE;
