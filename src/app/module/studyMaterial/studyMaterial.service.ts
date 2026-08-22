import AppError from '../../errorHelpers/AppError.js';
import { prisma } from '../../lib/prisma.js';
import { deleteFileFromCloudinary } from '../../utils/cloudinary.js';

// 1. Teacher uploads a material

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
        courseId: courseId,
      },
    },
  });

  if (!isEnrolled || isEnrolled.status !== 'ACTIVE') {
    throw new AppError(
      403,
      'You must be actively enrolled in this course to access its materials.'
    );
  }

  // C. Hand over the files
  return await prisma.studyMaterial.findMany({
    where: { courseId },
    include: {
      teacher: { include: { user: { select: { name: true } } } }, // Show who uploaded it
    },
    orderBy: { createdAt: 'desc' },
  });
};

// 3. Teacher/Admin view (No enrollment check needed)
const getMaterialsForCourseTeacher = async (courseId: string) => {
  return await prisma.studyMaterial.findMany({
    where: { courseId },
    include: {
      teacher: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

// 4. Delete material — enforce ownership: only uploader teacher or ADMIN can delete
const deleteStudyMaterial = async (id: string, authUser: any) => {
  // 1. Find the existing material
  const material = await prisma.studyMaterial.findUnique({
    where: { id },
    select: { id: true, teacherId: true, courseId: true, cloudinaryPublicId: true },
  });

  if (!material) {
    throw new AppError(404, 'Study material not found.');
  }

  // 2. ADMIN can delete any material
  const role = (authUser as any)?.role?.toUpperCase?.() || 'STUDENT';
  if (role === 'ADMIN') {
    // proceed
  } else {
    // 3. Ensure the requester is a Teacher and is the original uploader
    const teacher = await prisma.teacher.findUnique({ where: { userId: authUser.id } });
    if (!teacher) {
      throw new AppError(403, 'Only the uploading teacher or an admin can delete this material.');
    }

    if (teacher.id !== material.teacherId) {
      throw new AppError(403, 'You do not have permission to delete this material.');
    }
  }

  // 4. Delete cloudinary asset if present (best-effort)
  if (material.cloudinaryPublicId) {
    try {
      await deleteFileFromCloudinary(material.cloudinaryPublicId);
    } catch (err) {
      // Log and continue — DB record should still be deleted to avoid orphaned references in app
      console.warn('Failed to delete Cloudinary asset for material', material.id, err);
    }
  }

  // 5. Delete DB record
  const deleted = await prisma.studyMaterial.delete({ where: { id } });
  return deleted;
};

const uploadMaterial = async (
  userId: string,
  courseId: string,
  payload: { title: string; description?: string; fileUrl: string; cloudinaryPublicId?: string }
) => {
  // 1. Find the exact Teacher Profile linked to this User ID
  const teacher = await prisma.teacher.findUnique({
    where: { userId },
  });

  if (!teacher) {
    throw new AppError(404, 'Teacher profile not found.');
  }

  // 👉 THE FIX: Change findUnique to findFirst!
  // 2. SECURITY GATE: Ensure this teacher is actually assigned to this course!
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherId: teacher.id, // Now Prisma is perfectly happy to check this!
    },
  });

  if (!course) {
    throw new AppError(403, 'You do not have permission to upload materials to this class.');
  }

  // 3. Save the Cloudinary URL and details to the database
  const result = await prisma.studyMaterial.create({
    data: {
      title: payload.title,
      description: payload.description ?? null,
      fileUrl: payload.fileUrl,
      cloudinaryPublicId: payload.cloudinaryPublicId ?? null,
      courseId: course.id,
      teacherId: teacher.id,
    },
  });

  return result;
};

export const StudyMaterialServices = {
  getMaterialsForStudent,
  getMaterialsForCourseTeacher,
  deleteStudyMaterial,
  uploadMaterial,
};
