-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "teacherApplicantId" TEXT;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_teacherApplicantId_fkey" FOREIGN KEY ("teacherApplicantId") REFERENCES "TeacherApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;
