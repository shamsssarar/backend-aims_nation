import { Course } from '../../../generated/prisma/client.js';
import AppError from '../../errorHelpers/AppError.js';
import { prisma } from '../../lib/prisma.js';

// 👉 BACKEND: course.service.ts (or wherever createCourse lives)

const createCourse = async (payload: {
  title: string;
  description?: string;
  courseFee: number;
  maxCapacity?: number;
  teacherApplicantId: string; // The ID sent from your frontend dropdown
}) => {
  // 🕵️ STEP 1: Find the original job application to get their email
  const application = await prisma.teacherApplication.findUnique({
    where: { id: payload.teacherApplicantId },
  });

  if (!application) {
    throw new AppError(404, 'Teacher application not found.');
  }

  // 🕵️ STEP 2: Find the User account that was created when they were hired
  const user = await prisma.user.findUnique({
    where: { email: application.email },
  });

  if (!user) {
    throw new AppError(
      404,
      'User account for this teacher not found. Did the hiring process finish?'
    );
  }

  // 🕵️ STEP 3: Find their official Teacher Profile connected to that User account
  const teacherProfile = await prisma.teacher.findUnique({
    where: { userId: user.id },
  });

  if (!teacherProfile) {
    throw new AppError(404, 'Teacher profile not found.');
  }

  // 🚀 STEP 4: Create the Course using the REAL Teacher ID!
  const result = await prisma.course.create({
    data: {
      title: payload.title,
      description: payload.description,
      courseFee: payload.courseFee,
      maxCapacity: payload.maxCapacity,

      // We save the applicant ID just so the Admin table can easily show their name
      teacherApplicantId: payload.teacherApplicantId,

      // 👉 THIS IS THE MAGIC KEY: We link the course to their actual Teacher Profile!
      teacherId: teacherProfile.id,
    },
  });

  return result;
};

const getAllCourses = async (): Promise<Course[]> => {
  const result = await prisma.course.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: { teacherApplicant: { select: { name: true, email: true } } },
  });
  return result;
};

const getCourseById = async (id: string): Promise<Course | null> => {
  const result = await prisma.course.findUnique({
    where: { id },
    // Later, you can easily add `include: { batches: true }` here to see classes assigned to this course
  });
  return result;
};

const updateCourse = async (
  id: string,
  payload: Partial<{ title: string; description?: string; courseFee: number }>
): Promise<Course> => {
  const result = await prisma.course.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteCourse = async (id: string): Promise<Course> => {
  // SOFT DELETE: We update the deletedAt field instead of actually deleting the row
  const result = await prisma.course.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
  return result;
};

const getCourseRoster = async (teacherUserId: string, courseId: string) => {
  // 1. Security Check: Find the Teacher's profile
  const teacher = await prisma.teacher.findUnique({
    where: { userId: teacherUserId },
  });

  if (!teacher) throw new AppError(404, 'Teacher profile not found.');

  // 2. The Deep Query: Get Enrollments + Student + User + Latest Report
  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseId: courseId,
      // Security: Ensure this teacher actually owns the course!
      course: { teacherId: teacher.id },
      status: 'ACTIVE', // Only fetch active students (based on your EnrollmentStatus enum)
    },
    include: {
      student: {
        include: {
          // A. Fetch the actual name from the Auth User table
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          // B. Fetch ONLY the most recent weekly report for THIS specific course
          weeklyReports: {
            where: { courseId: courseId },
            orderBy: { createdAt: 'desc' }, // Newest first
            take: 1, // We only need the latest one to check the status!
          },
        },
      },
    },
  });

  // 3. Transform the data into a perfectly flat array for the Frontend
  const formattedRoster = enrollments.map((enrollment) => {
    const latestReport = enrollment.student.weeklyReports[0];

    // Logic to determine if a report is "Pending"
    // Let's say if there is NO report, or the last report was more than 7 days ago
    let lastReportStatus = 'Pending';

    if (latestReport) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      if (latestReport.createdAt >= oneWeekAgo) {
        // If they had a report this week, show the date!
        lastReportStatus = latestReport.createdAt.toLocaleDateString();
      }
    }

    return {
      enrollmentId: enrollment.id,
      studentId: enrollment.student.id,
      name: enrollment.student.user.name || 'Unknown Student',
      status: enrollment.status,
      lastReport: lastReportStatus,
      // You can also pass the full report object if you need it for an "Edit" button later
      reportId: latestReport ? latestReport.id : null,
    };
  });

  return formattedRoster;
};

export const CourseServices = {
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseRoster,
  updateCourse,
  deleteCourse,
};
