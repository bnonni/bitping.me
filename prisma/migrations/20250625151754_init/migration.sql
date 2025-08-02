/*
  Warnings:

  - You are about to drop the column `invoice` on the `Alert` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "payment_request" TEXT NOT NULL,
    "expires_at" BIGINT NOT NULL,
    "created" BIGINT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertType" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "phoneCarrier" TEXT,
    "emailAddress" TEXT,
    "triggerPrice" REAL NOT NULL,
    "triggerLogic" TEXT NOT NULL,
    "invoiceId" TEXT,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Alert_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Alert" ("alertType", "createdAt", "emailAddress", "id", "paid", "phoneCarrier", "phoneNumber", "sent", "triggerLogic", "triggerPrice") SELECT "alertType", "createdAt", "emailAddress", "id", "paid", "phoneCarrier", "phoneNumber", "sent", "triggerLogic", "triggerPrice" FROM "Alert";
DROP TABLE "Alert";
ALTER TABLE "new_Alert" RENAME TO "Alert";
CREATE UNIQUE INDEX "Alert_invoiceId_key" ON "Alert"("invoiceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
