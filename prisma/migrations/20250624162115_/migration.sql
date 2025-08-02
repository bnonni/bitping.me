-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "alertType" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "phoneCarrier" TEXT,
    "emailAddress" TEXT,
    "triggerPrice" REAL NOT NULL,
    "triggerLogic" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
