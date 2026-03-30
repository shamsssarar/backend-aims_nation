import AppError from '../../errorHelpers/AppError';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

// 1. PUBLIC: Submit a new application
const submitApplication = async (payload: any) => {
  // Prevent duplicate applications from the same email
  const existing = await prisma.teacherApplication.findUnique({
    where: { email: payload.email },
  });

  if (existing) {
    throw new AppError(400, 'An application with this email has already been submitted.');
  }

  const result = await prisma.teacherApplication.create({
    data: payload,
  });
  return result;
};

// 2. ADMIN: View all applications (You can add filters here later!)
const getAllApplications = async () => {
  return await prisma.teacherApplication.findMany({
    orderBy: { createdAt: 'desc' }, // Newest first
  });
};
const getApplicationById = async (id: string) => {
  return await prisma.teacherApplication.findFirst({
    where: { id },
    select: { status: true },
  });
};

// 3. ADMIN: Change status to REVIEWED or REJECTED
const updateApplicationStatus = async (id: string, status: any) => {
  // Ensure the application actually exists
  const application = await prisma.teacherApplication.findUnique({ where: { id } });
  if (!application) throw new AppError(404, 'Application not found');

  const result = await prisma.teacherApplication.update({
    where: { id },
    data: { status },
  });
  return result;
};

const hireApplicant = async (applicationId: string, payload: { salary: number; bio?: string }) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Verify the application exists and isn't already processed
    const application = await tx.teacherApplication.findUnique({ where: { id: applicationId } });
    if (!application) throw new AppError(404, 'Application not found');
    if (application.status === 'HIRED')
      throw new AppError(400, 'This applicant has already been hired!');

    // 2. Generate a temporary password (e.g., AimsNation2026!)
    const tempPassword = `AimsNation${new Date().getFullYear()}!`;
    // ⚠️ In production, ensure you hash this password before saving it to your auth table!
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);
    // 3. Create the Base User (Authentication)
    const newUser = await tx.user.create({
      data: {
        name: application.name,
        email: application.email,
        role: 'TEACHER', // Strictly locked to Teacher

        // If your better-auth schema requires the password directly on the user table, add it here.
      },
    });
    await tx.account.create({
      data: {
        id: crypto.randomUUID(),
        userId: newUser.id,
        accountId: application.email,
        password: hashedPassword,
        providerId: 'credential',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 4. Create the Official Teacher Profile
    const newTeacherProfile = await tx.teacher.create({
      data: {
        userId: newUser.id,
        salary: payload.salary,
        bio: payload.bio || `Specialist in ${application.specialty}`,
        certifications: application.specialty,
      },
    });

    // 5. Update the Application Status
    await tx.teacherApplication.update({
      where: { id: applicationId },
      data: { status: 'HIRED' },
    });

    // Return the data so the Admin dashboard can show the temporary password to you
    return {
      teacherName: newUser.name,
      email: newUser.email,
      temporaryPassword: tempPassword,
      profile: newTeacherProfile,
    };
  });
};

export const TeacherApplicationServices = {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  hireApplicant,
};
