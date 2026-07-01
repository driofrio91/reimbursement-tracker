-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ReimbursableServiceStatus" AS ENUM ('REGISTERED', 'SUBMITTED', 'REIMBURSED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('CREATED', 'INFORMATION_COMPLETED', 'CLAIM_REFERENCE_COMPLETED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "mustChangePasswordOnFirstLogin" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceHolderAnnualReimbursementLimit" (
    "id" UUID NOT NULL,
    "insuranceHolderPersonId" UUID NOT NULL,
    "insurerId" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "annualLimitAmount" DECIMAL(10,2) NOT NULL DEFAULT 1500,
    "reimbursedAccumulated" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceHolderAnnualReimbursementLimit_pkey" PRIMARY KEY ("id")
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
    "isActive" BOOLEAN NOT NULL DEFAULT true,
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
    "invoiceBilledAmount" DECIMAL(10,2) NOT NULL DEFAULT 55,
    "invoiceExpectedAmount" DECIMAL(10,2) NOT NULL DEFAULT 49.5,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "insuranceHolderPersonId" UUID NOT NULL,
    "insurerId" UUID NOT NULL,
    "serviceRecipientName" TEXT NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT true,
    "status" "ReimbursableServiceStatus" NOT NULL DEFAULT 'REGISTERED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReimbursableService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "insuranceHolderPersonId" UUID,
    "insurerId" UUID,
    "invoiceNumber" TEXT,
    "invoiceDate" DATE,
    "invoiceBilledAmount" DECIMAL(10,2) NOT NULL DEFAULT 55,
    "invoiceExpectedAmount" DECIMAL(10,2) NOT NULL DEFAULT 49.5,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "issuerName" TEXT,
    "issuerTaxId" TEXT,
    "claimReference" TEXT,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'CREATED',
    "paidAmount" DECIMAL(10,2),
    "paidAt" DATE,
    "rejectionReason" TEXT,
    "correctedAt" TIMESTAMP(3),
    "correctionReason" TEXT,
    "correctedFromStatus" "InvoiceStatus",
    "correctedByUserId" UUID,
    "correctedByUserName" TEXT,
    "notes" TEXT,
    "createdManually" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "InsuranceHolderAnnualReimbursementLimit_year_idx" ON "InsuranceHolderAnnualReimbursementLimit"("year");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceHolderAnnualReimbursementLimit_insuranceHolderPers_key" ON "InsuranceHolderAnnualReimbursementLimit"("insuranceHolderPersonId", "insurerId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Insurer_code_key" ON "Insurer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Person_displayName_key" ON "Person"("displayName");

-- CreateIndex
CREATE INDEX "ReimbursableService_insuranceHolderPersonId_idx" ON "ReimbursableService"("insuranceHolderPersonId");

-- CreateIndex
CREATE INDEX "ReimbursableService_insurerId_idx" ON "ReimbursableService"("insurerId");

-- CreateIndex
CREATE INDEX "ReimbursableService_status_idx" ON "ReimbursableService"("status");

-- CreateIndex
CREATE INDEX "ReimbursableService_serviceDate_idx" ON "ReimbursableService"("serviceDate");

-- CreateIndex
CREATE INDEX "Invoice_serviceId_idx" ON "Invoice"("serviceId");

-- CreateIndex
CREATE INDEX "Invoice_insuranceHolderPersonId_idx" ON "Invoice"("insuranceHolderPersonId");

-- CreateIndex
CREATE INDEX "Invoice_insurerId_idx" ON "Invoice"("insurerId");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- CreateIndex
CREATE INDEX "Invoice_invoiceDate_idx" ON "Invoice"("invoiceDate");

-- CreateIndex
CREATE INDEX "Invoice_status_invoiceDate_idx" ON "Invoice"("status", "invoiceDate");

-- AddForeignKey
ALTER TABLE "InsuranceHolderAnnualReimbursementLimit" ADD CONSTRAINT "InsuranceHolderAnnualReimbursementLimit_insuranceHolderPer_fkey" FOREIGN KEY ("insuranceHolderPersonId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceHolderAnnualReimbursementLimit" ADD CONSTRAINT "InsuranceHolderAnnualReimbursementLimit_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReimbursableService" ADD CONSTRAINT "ReimbursableService_insuranceHolderPersonId_fkey" FOREIGN KEY ("insuranceHolderPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReimbursableService" ADD CONSTRAINT "ReimbursableService_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ReimbursableService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_insuranceHolderPersonId_fkey" FOREIGN KEY ("insuranceHolderPersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
