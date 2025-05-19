/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Message_publicId_key" ON "Message"("publicId");
