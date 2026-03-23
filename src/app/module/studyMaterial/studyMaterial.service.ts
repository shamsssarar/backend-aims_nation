import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";


// 1. Teacher uploads a material
const createStudyMaterial = async (authUserId: string, payload: any) => {
  // Find the Teacher's profile ID
  const teacherProfile = await prisma.teacher.findUnique({ where: { userId: authUserId } });
  
  // If an Admin is uploading, we might bypass this, but let's assume Teachers do the uploading
  if (!teacherProfile) throw new AppError(403, 'Only official teachers can upload materials.');

  const result = await prisma.studyMaterial.create({
    data: {
      ...payload,
      teacherId: teacherProfile.id, // Stamp it with the exact teacher who uploaded it
    },
  });
  return result;
};

// 2. Student requests materials for a specific course
const getMaterialsForStudent = async (authUserId: string, courseId: string) => {
  // A. Find the Student profile
  const studentProfile = await prisma.student.findUnique({ where: { userId: authUserId } });
  if (!studentProfile) throw new AppError(404, 'Student profile not found.');

  // B. THE BOUNCER: Check if they are actually enrolled and ACTIVE
  const isEnrolled = await prisma.enrollment.findUnique({
    where: { 
      studentId_courseId: { 
        studentId: studentProfile.id, 
        courseId: courseId 
      } 
    }
  });

  if (!isEnrolled || isEnrolled.status !== 'ACTIVE') {
    throw new AppError(403, 'You must be actively enrolled in this course to access its materials.');
  }

  // C. Hand over the files
  return await prisma.studyMaterial.findMany({
    where: { courseId },
    include: {
      teacher: { include: { user: { select: { name: true } } } } // Show who uploaded it
    },
    orderBy: { createdAt: 'desc' },
  });
};

// 3. Teacher/Admin view (No enrollment check needed)
const getMaterialsForCourseTeacher = async (courseId: string) => {
  return await prisma.studyMaterial.findMany({
    where: { courseId },
    include: {
      teacher: { include: { user: { select: { name: true } } } }
    },
    orderBy: { createdAt: 'desc' },
  });
};

// 4. Delete material
const deleteStudyMaterial = async (id: string) => {
  return await prisma.studyMaterial.delete({
    where: { id },
  });
};

export const StudyMaterialServices = {
  createStudyMaterial,
  getMaterialsForStudent,
  getMaterialsForCourseTeacher,
  deleteStudyMaterial,
};