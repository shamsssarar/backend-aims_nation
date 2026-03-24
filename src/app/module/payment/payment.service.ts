import AppError from '../../errorHelpers/AppError';
import { prisma } from '../../lib/prisma';

// 1. Student requests to join a course
// Notice I renamed the parameter to authUserId to make it obvious!
const createPendingPayment = async (authUserId: string, courseId: string) => {
  // 👉 1. THE FIX: Find the actual Student Profile using the Auth User ID
  const studentProfile = await prisma.student.findUnique({
    where: { userId: authUserId },
  });

  if (!studentProfile) {
    throw new AppError(403, 'Student profile not found. Please complete your profile setup.');
  }

  const actualStudentId = studentProfile.id; // We use THIS for the rest of the function

  // 2. Check if they are already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: actualStudentId, courseId } },
  });
  if (existingEnrollment) throw new AppError(400, 'You are already enrolled in this course.');

  // 3. Check if they already have a pending invoice for this
  const existingPayment = await prisma.invoice.findFirst({
    where: { studentId: actualStudentId, courseId, status: 'PENDING' },
  });
  if (existingPayment)
    throw new AppError(400, 'You already have a pending request for this course.');

  // 4. Get the real course fee from the database
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError(404, 'Course not found.');

  // 5. Create the PENDING invoice using the correct Profile ID
  const result = await prisma.invoice.create({
    data: {
      studentId: actualStudentId, // 👉 Mapped to the correct table!
      courseId,
      amount: course.courseFee,
      status: 'PENDING',
    },
  });
  return result;
};
// 2. Admin confirms payment & auto-enrolls (THE TRANSACTION)
const confirmPaymentAndEnroll = async (paymentId: string) => {
  // A transaction ensures both actions succeed, or neither do.
  return await prisma.$transaction(async (tx) => {
    // A. Find the invoice
    const payment = await tx.invoice.findUnique({ where: { id: paymentId } });
    if (!payment) throw new AppError(404, 'Invoice not found');
    if (payment.status === 'PAID') throw new AppError(400, 'Invoice is already paid');

    // B. Mark invoice as PAID
    const updatedInvoice = await tx.invoice.update({
      where: { id: paymentId },
      data: { status: 'PAID', paymentDate: new Date() },
    });

    // C. Automatically officially enroll the student!
    await tx.enrollment.create({
      data: {
        studentId: payment.studentId,
        courseId: payment.courseId,
        status: 'ACTIVE',
      },
    });

    return updatedInvoice;
  });
};

// 3. For the Student Dashboard
const getMyPayments = async (studentId: string) => {
  return await prisma.invoice.findMany({
    where: { studentId },
    include: { course: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

// 4. For the Admin Dashboard
const getAllPayments = async () => {
  return await prisma.invoice.findMany({
    include: {
      student: { select: { user: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const PaymentServices = {
  createPendingPayment,
  confirmPaymentAndEnroll,
  getMyPayments,
  getAllPayments,
};
