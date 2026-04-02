import AppError from '../../errorHelpers/AppError.js';
import { prisma } from '../../lib/prisma.js';

// 1. Teacher creates a report
const createWeeklyReport = async (authUserId: string, payload: any) => {
  // A. Find the Teacher's profile ID using their login ID
  const teacherProfile = await prisma.teacher.findUnique({ where: { userId: authUserId } });
  if (!teacherProfile) throw new AppError(403, 'Teacher profile not found.');

  // B. Verify the student is actually enrolled in this course
  const isEnrolled = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: payload.studentId, courseId: payload.courseId } },
  });

  if (!isEnrolled) {
    throw new AppError(400, 'Cannot create a report for a student not enrolled in this course.');
  }

  // C. Create the report
  const result = await prisma.weeklyReport.create({
    data: {
      ...payload,
      teacherId: teacherProfile.id, // Attach the exact teacher who wrote this
    },
  });
  return result;
};

// 2. Student views their own reports
const getMyReports = async (authUserId: string) => {
  // A. Find the Student's profile ID
  const studentProfile = await prisma.student.findUnique({ where: { userId: authUserId } });
  if (!studentProfile)
    throw new AppError(404, 'Student profile not found. Please complete onboarding.');

  // B. Fetch reports belonging ONLY to this student profile
  return await prisma.weeklyReport.findMany({
    where: { studentId: studentProfile.id },
    include: {
      course: { select: { title: true } },
      teacher: { include: { user: { select: { name: true } } } }, // Gets the teacher's name
    },
    orderBy: { weekStartDate: 'desc' },
  });
};

// 3. Teacher/Admin views reports for a course
const getCourseReports = async (courseId: string) => {
  return await prisma.weeklyReport.findMany({
    where: { courseId },
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
    },
    orderBy: { weekStartDate: 'desc' },
  });
};

export const WeeklyReportServices = {
  createWeeklyReport,
  getMyReports,
  getCourseReports,
};
