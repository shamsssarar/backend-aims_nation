import { EnrollmentModel } from '../../../generated/prisma/models/Enrollment';
import AppError from '../../errorHelpers/AppError';
import { prisma } from '../../lib/prisma';

const createEnrollment = async (payload: { studentId: string; courseId: string }) => {
  // 1. Check if already enrolled
  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: {
        studentId: payload.studentId,
        courseId: payload.courseId,
      },
    },
  });

  if (existing) {
    throw new AppError(400, 'Student is already enrolled in this course.');
  }

  // 2. Create the enrollment
  const result = await prisma.enrollment.create({
    data: payload,
    include: {
      student: { select: { name: true, email: true } },
      course: { select: { title: true, courseFee: true } },
    },
  });
  return result;
};

const getAllEnrollments = async (studentId: string) => {
  const result = await prisma.enrollment.findMany({
    where: { studentId },
    include: {
      student: true,
      course: true,
    },
    orderBy: {
      enrollmentDate: 'desc',
    },
  });
  return result;
};

const getMyEnrollments = async (studentId: string) => {
  const result = await prisma.enrollment.findMany({
    where: {
      studentId: studentId,
      status: 'ACTIVE', // You might only want to show active courses
    },
    include: {
      course: true, // Pulls in the Course title, description, and fee
    },
    orderBy: {
      enrollmentDate: 'desc',
    },
  });
  return result;
};

const getCourseEnrollments = async (courseId: string) => {
  const result = await prisma.enrollment.findMany({
    where: {
      courseId: courseId,
      status: 'ACTIVE',
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          // We specifically DO NOT select the password or role here for security
        },
      },
    },
    orderBy: {
      enrollmentDate: 'desc',
    },
  });
  return result;
};

// const updateEnrollment = async (
//   id: string,
//   payload: Partial<{ status: 'ACTIVE' | 'DROPPED' | 'COMPLETED' }>
// ): Promise<EnrollmentModel> => {
//   const result = await prisma.enrollment.update({
//     where: { id },
//     data: payload,
//   });
//   return result;
// };

// const deleteEnrollment = async (id: string): Promise<EnrollmentModel> => {
//   const result = await prisma.enrollment.delete({
//     where: { id },
//   });
//   return result;
// };

export const EnrollmentServices = {
  createEnrollment,
  getAllEnrollments,
  getMyEnrollments,
  getCourseEnrollments,
  //   getEnrollmentById,
  //   updateEnrollment,
  //   deleteEnrollment,
};
