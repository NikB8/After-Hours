-- AlterTable
ALTER TABLE "Event" ADD COLUMN "actual_cost" DECIMAL;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Participant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Declined',
    "is_paid" BOOLEAN NOT NULL DEFAULT false,
    "amount_due" DECIMAL NOT NULL DEFAULT 0,
    "transport_mode" TEXT NOT NULL DEFAULT 'Independent',
    "car_seats" INTEGER NOT NULL DEFAULT 0,
    "pickup_location" TEXT,
    "assigned_driver_id" TEXT,
    "team_name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Participant_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Participant" ("assigned_driver_id", "car_seats", "createdAt", "event_id", "id", "is_paid", "pickup_location", "status", "team_name", "transport_mode", "updatedAt", "user_id") SELECT "assigned_driver_id", "car_seats", "createdAt", "event_id", "id", "is_paid", "pickup_location", "status", "team_name", "transport_mode", "updatedAt", "user_id" FROM "Participant";
DROP TABLE "Participant";
ALTER TABLE "new_Participant" RENAME TO "Participant";
CREATE UNIQUE INDEX "Participant_event_id_user_id_key" ON "Participant"("event_id", "user_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
