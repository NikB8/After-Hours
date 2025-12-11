-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizer_id" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME NOT NULL,
    "venue_name" TEXT NOT NULL,
    "map_link" TEXT NOT NULL,
    "max_players" INTEGER NOT NULL,
    "estimated_cost" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Event_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Event_organizer_id_idx" ON "Event"("organizer_id");

-- CreateIndex
CREATE INDEX "Event_start_time_idx" ON "Event"("start_time");
