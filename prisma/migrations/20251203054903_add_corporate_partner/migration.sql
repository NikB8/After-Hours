-- CreateTable
CREATE TABLE "CorporatePartner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "domain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hrms_provider" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "webhook_secret" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CorporatePartner_domain_key" ON "CorporatePartner"("domain");
