/*
  Warnings:

  - You are about to drop the column `projectId` on the `Collection` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Collection" DROP CONSTRAINT "Collection_projectId_fkey";

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "projectId";

-- CreateTable
CREATE TABLE "ProjectCollection" (
    "id" SERIAL NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "projectId" INTEGER,
    "collectionId" INTEGER,

    CONSTRAINT "ProjectCollection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProjectCollection" ADD CONSTRAINT "ProjectCollection_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCollection" ADD CONSTRAINT "ProjectCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
