/*
  Warnings:

  - You are about to drop the column `created` on the `Invoice` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `Invoice` table without a default value. This is not possible if the table is not empty.

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
    "createdAt" BIGINT NOT NULL
);
INSERT INTO "new_Invoice" ("amount", "currency", "expiresAt", "id", "paymentRequest", "status") SELECT "amount", "currency", "expiresAt", "id", "paymentRequest", "status" FROM "Invoice";
DROP TABLE "Invoice";
ALTER TABLE "new_Invoice" RENAME TO "Invoice";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
