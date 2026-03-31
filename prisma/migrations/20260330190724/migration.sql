/*
  Warnings:

  - You are about to drop the column `contactNumber` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "contactNumber",
ADD COLUMN     "contactNo" TEXT;
