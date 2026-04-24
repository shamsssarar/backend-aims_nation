import { Enrollment } from '@prisma/client';
import AppError from '../../errorHelpers/AppError.js';
// import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { randomUUID } from 'crypto';
import { IQueryParams, IQueryResult } from '../../interfaces/query.interface.js';
import { QueryBuilder } from '../../utils/queryBuilder.js';

const createEnrollment = async (payload: { studentId: string; courseId: string }) => {
  const { studentId, courseId } = payload;

  // 1. Prevent duplicate enrollments
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      studentId_courseId: { studentId, courseId },
    },
  });

  if (existingEnrollment) {
    throw new AppError(400, 'Student is already enrolled in this course.');
  }

  // 2. Fetch the course to capture the correct course fee for the invoice
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new AppError(404, 'Course not found.');
  }

  // 3. Execute the Database Transaction
  // @ts-ignore
  const result = await prisma.$transaction(async (tx) => {
    // A. Check if the student already tried to buy it and has a PENDING invoice
    const existingInvoice = await tx.invoice.findFirst({
      where: { studentId, courseId, status: 'PENDING' },
    });

    if (existingInvoice) {
      // If they had a pending invoice, mark it as PAID so it doesn't get stuck
      await tx.invoice.update({
        where: { id: existingInvoice.id },
        data: { status: 'PAID', paymentDate: new Date() },
      });
    } else {
      // B. If they didn't have an invoice, auto-generate a PAID one for the financial ledger
      await tx.invoice.create({
        data: {
          transactionId: randomUUID(),
          studentId,
          courseId,
          amount: course.courseFee,
          status: 'PAID',
          paymentDate: new Date(),
        },
      });
    }

    // C. Create the official Enrollment record
    const newEnrollment = await tx.enrollment.create({
      data: {
        studentId,
        courseId,
        status: 'ACTIVE', // Ensure it is explicitly marked active
      },
      include: {
        student: { select: { user: true } },
        course: { select: { title: true, courseFee: true } },
      },
    });

    return newEnrollment;
  });

  return result;
};

const getAllEnrollments = async (query: IQueryParams): Promise<IQueryResult<Enrollment>> => {
  // 1. Initialize Builder
  const enrollmentQuery = new QueryBuilder<Enrollment>(prisma.enrollment, query, {
    // Search by course title or the student's actual user name!
    searchableFields: ['course.title', 'student.user.name', 'student.user.email'],
    // This allows the frontend to dynamically pass ?studentId=XYZ or ?status=ACTIVE
    filterableFields: ['studentId', 'courseId', 'status'],
  });

  // 2. Chain and Execute
  const result = await enrollmentQuery
    .search()
    .filter()
    .sort() // To match your old default, you can pass ?sortBy=enrollmentDate in the URL
    .paginate()
    .include({
      // Keeping your exact include structure!
      student: true,
      course: true,
    })
    .execute();

  return result;
};

const getMyEnrollments = async (authUserId: string) => {
  // 👉 1. THE FIX: Find the actual Student Profile using the Auth User ID
  const studentProfile = await prisma.student.findUnique({
    where: { userId: authUserId },
  });

  if (!studentProfile) {
    throw new AppError(404, 'Student profile not found.');
  }

  const studentId = studentProfile.id;

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
          user: true,
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
