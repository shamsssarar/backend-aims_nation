/*
  Warnings:

  - Changed the type of `courseFee` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "courseFee",
ADD COLUMN     "courseFee" INTEGER NOT NULL;
