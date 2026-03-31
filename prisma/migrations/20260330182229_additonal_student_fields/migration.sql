/*
  Warnings:

  - You are about to drop the column `parentContactNumber` on the `Student` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Student" DROP COLUMN "parentContactNumber",
ADD COLUMN     "bloodGroup" TEXT,
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "fathersName" TEXT,
ADD COLUMN     "mothersName" TEXT;
