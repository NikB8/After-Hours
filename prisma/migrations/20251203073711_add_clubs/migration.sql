-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "company_domain" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Club_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClubMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "club_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClubMember_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClubMember_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizer_id" TEXT NOT NULL,
    "club_id" TEXT,
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
    CONSTRAINT "Event_organizer_id_fkey" FOREIGN KEY ("organizer_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Event_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "Club" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("createdAt", "end_time", "estimated_cost", "id", "map_link", "max_players", "organizer_id", "sport", "start_time", "status", "updatedAt", "venue_name") SELECT "createdAt", "end_time", "estimated_cost", "id", "map_link", "max_players", "organizer_id", "sport", "start_time", "status", "updatedAt", "venue_name" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_organizer_id_idx" ON "Event"("organizer_id");
CREATE INDEX "Event_start_time_idx" ON "Event"("start_time");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Club_company_domain_idx" ON "Club"("company_domain");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMember_club_id_user_id_key" ON "ClubMember"("club_id", "user_id");
