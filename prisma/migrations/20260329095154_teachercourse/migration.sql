-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "maxCapacity" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "roomNumber" TEXT,
ADD COLUMN     "schedule" TEXT,
ADD COLUMN     "teacherId" TEXT;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
