/*
  Warnings:

  - You are about to drop the column `is_read` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `link_url` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `recipient_id` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `trigger_user_id` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `PushSubscription` table. All the data in the column will be lost.
  - Added the required column `recipientId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PushSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_recipient_id_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_trigger_user_id_fkey";

-- DropForeignKey
ALTER TABLE "PushSubscription" DROP CONSTRAINT "PushSubscription_user_id_fkey";

-- DropIndex
DROP INDEX "Notification_recipient_id_idx";

-- DropIndex
DROP INDEX "PushSubscription_user_id_idx";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "is_read",
DROP COLUMN "link_url",
DROP COLUMN "recipient_id",
DROP COLUMN "trigger_user_id",
ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "linkUrl" TEXT,
ADD COLUMN     "recipientId" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "triggerUserId" TEXT;

-- AlterTable
ALTER TABLE "PushSubscription" DROP COLUMN "user_id",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_triggerUserId_fkey" FOREIGN KEY ("triggerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
