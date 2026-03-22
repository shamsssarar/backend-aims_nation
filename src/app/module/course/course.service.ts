import { Course } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';

const createCourse = async (payload: {
  title: string;
  description?: string;
  courseFee: number;
}): Promise<Course> => {
  const result = await prisma.course.create({
    data: payload,
  });
  return result;
};

const getAllCourses = async (): Promise<Course[]> => {
  const result = await prisma.course.findMany({
    orderBy: {
      createdAt: 'desc',
    },
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

export const CourseServices = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
