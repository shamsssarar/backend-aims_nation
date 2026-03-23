import AppError from '../../errorHelpers/AppError';
import { prisma } from '../../lib/prisma';

const createStudentProfile = async (userId: string, payload: any) => {
  // 1. Verify the User exists and is actually a STUDENT
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');
  if (user.role !== 'STUDENT')
    throw new AppError(403, 'Only students can create a student profile');

  // 2. Prevent duplicate profiles
  const existingProfile = await prisma.student.findUnique({
    where: { userId },
  });
  if (existingProfile) {
    throw new AppError(400, 'You have already completed your profile setup.');
  }

  // 3. Create the 1-to-1 Profile Link
  const result = await prisma.student.create({
    data: {
      userId,
      parentContactNumber: payload.parentContactNumber,
      schoolGrade: payload.schoolGrade,
      address: payload.address,
      dateOfBirth: payload.dateOfBirth ? new Date(payload.dateOfBirth) : null,
    },
    // Include the base user data so the frontend gets the full picture back
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return result;
};

// A helper service to fetch the full profile when they log in
const getMyProfile = async (userId: string, role: string) => {
  if (role === 'STUDENT') {
    return await prisma.student.findUnique({ where: { userId }, include: { user: true } });
  } else if (role === 'TEACHER') {
    return await prisma.teacher.findUnique({ where: { userId }, include: { user: true } });
  } else if (role === 'ADMIN') {
    return await prisma.admin.findUnique({ where: { userId }, include: { user: true } });
  }
  throw new AppError(400, 'Invalid user role');
};

export const ProfileServices = {
  createStudentProfile,
  getMyProfile,
};
