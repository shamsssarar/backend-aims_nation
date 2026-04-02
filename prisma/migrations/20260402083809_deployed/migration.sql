/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Made the column `transactionId` on table `Invoice` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Invoice" ALTER COLUMN "transactionId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_transactionId_key" ON "Invoice"("transactionId");
