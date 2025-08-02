/*
  Warnings:

  - You are about to drop the column `expires_at` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `payment_request` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `Invoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentRequest` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Invoice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentRequest" TEXT NOT NULL,
    "expiresAt" BIGINT NOT NULL,
    "created" BIGINT NOT NULL
);
INSERT INTO "new_Invoice" ("amount", "created", "currency", "id", "status") SELECT "amount", "created", "currency", "id", "status" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
