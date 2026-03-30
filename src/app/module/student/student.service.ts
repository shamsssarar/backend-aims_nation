import { prisma } from "../../lib/prisma";

const getAllStudents = async () => {
  const students = await prisma.student.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Flatten the object so it's perfectly clean for the frontend table
  return students.map(student => ({
    id: student.id,
    userId: student.userId,
    name: student.user?.name || "Unknown",
    email: student.user?.email || "Unknown",
    // Include these if they exist in your Prisma schema, otherwise they will just safely return undefined
    contactNo: (student as any).contactNo || "N/A", 
    guardianName: (student as any).guardianName || "N/A"
  }));
};

export const StudentServices = { getAllStudents };