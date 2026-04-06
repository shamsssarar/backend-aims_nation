import { prisma } from '../../lib/prisma.js';

const getAllStudents = async () => {
  const students = await prisma.student.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Flatten the object so it's perfectly clean for the frontend table
  return students.map((student) => ({
    id: student.id,
    userId: student.userId,
    name: student.user?.name || 'Unknown',
    email: student.user?.email || 'Unknown',
    // Include these if they exist in your Prisma schema, otherwise they will just safely return undefined
    contactNo: student.contactNo || 'N/A',
    bloodGroup: student.bloodGroup || 'N/A',
  }));
};

const updateStudent = async (
  id: string,
  payload: Partial<{ contactNo?: string; bloodGroup?: string }>
): Promise<any> => {
  const result = await prisma.student.update({
    where: { id },
    data: payload,
  });
  return result;
};

export const StudentServices = { getAllStudents, updateStudent };
