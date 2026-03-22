import AppError from '../../errorHelpers/AppError';
import { prisma } from '../../lib/prisma';

// 1. Student requests to join a course
const createPendingPayment = async (studentId: string, courseId: string) => {
  // Check if they are already enrolled
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId, courseId } },
  });
  if (existingEnrollment) throw new AppError(400, 'You are already enrolled in this course.');

  // Check if they already have a pending invoice for this
  const existingPayment = await prisma.invoice.findFirst({
    where: { studentId, courseId, status: 'PENDING' },
  });
  if (existingPayment)
    throw new AppError(400, 'You already have a pending request for this course.');

  // Get the real course fee from the database
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError(404, 'Course not found.');

  // Create the PENDING invoice
  const result = await prisma.invoice.create({
    data: {
      studentId,
      courseId,
      amount: course.courseFee, // Capturing the price at the time of request
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
      student: { select: { name: true, email: true } },
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
