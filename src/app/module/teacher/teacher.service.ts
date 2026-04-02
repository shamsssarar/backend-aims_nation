// src/app/module/teacher/teacher.service.ts
import AppError from '../../errorHelpers/AppError.js';
import { prisma } from '../../lib/prisma.js'; // Adjust path to your prisma instance

const getMyClasses = async (userId: string) => {
  // 1. Find the Teacher profile using the authenticated User's ID
  const teacherProfile = await prisma.teacher.findUnique({
    where: { userId },
    include: {
      // 2. Fetch the courses assigned to this specific teacher
      courses: {
        include: {
          // 3. Count how many students are enrolled in each class
          _count: {
            select: { enrollments: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });

  if (!teacherProfile) {
    throw new AppError(404, 'Teacher profile not found. Please complete your profile setup first.');
  }

  // We only want to return the courses array to the frontend
  return teacherProfile.courses;
};

const getAllTeachers = async () => {
  const teachers = await prisma.teacher.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Let's format it nicely for the frontend dropdown!
  return teachers.map((teacher) => ({
    id: teacher.id,
    userId: teacher.userId,
    name: teacher.user.name,
    email: teacher.user.email,
    salary: teacher.salary,
    contactNo: teacher.contactNo,
  }));
};

const updateTeacher = async (
  id: string,
  // We'll let the Admin update Salary, Bio, and Contact Number
  payload: Partial<{ salary?: number; contactNo?: string }>
) => {
  const result = await prisma.teacher.update({
    where: { id },
    data: payload,
  });
  return result;
};

// Export it

export const TeacherServices = {
  getMyClasses,
  getAllTeachers,
  updateTeacher,
};
