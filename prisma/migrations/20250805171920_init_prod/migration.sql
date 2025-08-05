-- CreateTable
CREATE TABLE "public"."Alert" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alertType" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "phoneCarrier" TEXT,
    "emailAddress" TEXT,
    "triggerPrice" DOUBLE PRECISION NOT NULL,
    "triggerLogic" TEXT NOT NULL,
    "sent" BOOLEAN NOT NULL DEFAULT false,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "exchange" TEXT NOT NULL,
    "invoiceId" TEXT,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Invoice" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentRequest" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Alert_invoiceId_key" ON "public"."Alert"("invoiceId");

-- AddForeignKey
ALTER TABLE "public"."Alert" ADD CONSTRAINT "Alert_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
