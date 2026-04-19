-- CreateEnum
CREATE TYPE "ReimbursableServiceStatus" AS ENUM ('REGISTERED', 'SUBMITTED', 'REIMBURSED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('RECEIVED', 'SUBMITTED', 'REJECTED', 'REIMBURSED');

-- CreateEnum
CREATE TYPE "ReimbursementRequestStatus" AS ENUM ('SUBMITTED', 'REIMBURSED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insurer" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insurer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "documentNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReimbursableService" (
    "id" UUID NOT NULL,
    "serviceDate" DATE NOT NULL,
    "description" TEXT NOT NULL,
    "actualAmount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "personId" UUID NOT NULL,
    "insurerId" UUID NOT NULL,
    "policyHolderName" TEXT NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT true,
    "status" "ReimbursableServiceStatus" NOT NULL DEFAULT 'REGISTERED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReimbursableService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReimbursementRequest" (
    "id" UUID NOT NULL,
    "insurerId" UUID NOT NULL,
    "policyHolderName" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL,
    "externalReference" TEXT,
    "status" "ReimbursementRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReimbursementRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "requestId" UUID,
    "invoiceNumber" TEXT NOT NULL,
    "invoiceDate" DATE NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "issuerName" TEXT NOT NULL,
    "issuerTaxId" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'RECEIVED',
    "reimbursedAmount" DECIMAL(10,2),
    "reimbursedAt" DATE,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Insurer_code_key" ON "Insurer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Person_displayName_key" ON "Person"("displayName");

-- CreateIndex
CREATE INDEX "ReimbursableService_personId_idx" ON "ReimbursableService"("personId");

-- CreateIndex
CREATE INDEX "ReimbursableService_insurerId_idx" ON "ReimbursableService"("insurerId");

-- CreateIndex
CREATE INDEX "ReimbursableService_status_idx" ON "ReimbursableService"("status");

-- CreateIndex
CREATE INDEX "ReimbursableService_serviceDate_idx" ON "ReimbursableService"("serviceDate");

-- CreateIndex
CREATE INDEX "ReimbursementRequest_insurerId_idx" ON "ReimbursementRequest"("insurerId");

-- CreateIndex
CREATE INDEX "ReimbursementRequest_status_idx" ON "ReimbursementRequest"("status");

-- CreateIndex
CREATE INDEX "ReimbursementRequest_submittedAt_idx" ON "ReimbursementRequest"("submittedAt");

-- CreateIndex
CREATE INDEX "Invoice_serviceId_idx" ON "Invoice"("serviceId");

-- CreateIndex
CREATE INDEX "Invoice_requestId_idx" ON "Invoice"("requestId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");

-- AddForeignKey
ALTER TABLE "ReimbursableService" ADD CONSTRAINT "ReimbursableService_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReimbursableService" ADD CONSTRAINT "ReimbursableService_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReimbursementRequest" ADD CONSTRAINT "ReimbursementRequest_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ReimbursableService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ReimbursementRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
