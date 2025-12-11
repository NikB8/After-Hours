-- AlterTable
ALTER TABLE "User" ADD COLUMN "bio" TEXT;

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recommender_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_info" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "event_id" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recommendation_recommender_id_fkey" FOREIGN KEY ("recommender_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Recommendation_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Recommendation_recommender_id_idx" ON "Recommendation"("recommender_id");
