import { envVars } from '../../config/env';
import AppError from '../../errorHelpers/AppError';
import { prisma } from '../../lib/prisma';
import SSLCommerzPayment from 'sslcommerz-lts';

// 1. Student requests to join a course
// Notice I renamed the parameter to authUserId to make it obvious!
const createPendingPayment = async (
  authUserId: string,
  courseId: string,
  paymentMethod: string,
  transactionId: string
) => {
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
      transactionId,
      paymentMethod,
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
// Inside payment.service.ts
const getMyPayments = async (authUserId: string) => {
  // 1. Find the actual Student Profile first!
  const studentProfile = await prisma.student.findUnique({
    where: { userId: authUserId },
  });

  if (!studentProfile) return []; // If no profile, they have no payments

  // 2. Search using the Student Profile ID!
  return await prisma.invoice.findMany({
    where: { studentId: studentProfile.id },
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

const store_id = envVars.sslCommerz.SSLCOMMERZ_STORE_ID;
const store_passwd = envVars.sslCommerz.SSLCOMMERZ_STORE_PASS;
const is_live = envVars.sslCommerz.SSLCOMMERZ_IS_LIVE ? true : false;

const initPayment = async (authUserId: string, courseId: string) => {
  // 1. Get Student and Course Details
  const student = await prisma.student.findUnique({
    where: { userId: authUserId },
    include: { user: true },
  });
  if (!student) throw new AppError(404, 'Student not found');

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) throw new AppError(404, 'Course not found');

  // 2. Generate a Unique Transaction ID
  const tran_id = `AIMS_${new Date().getTime()}_${Math.floor(Math.random() * 1000)}`;

  // 3. Save PENDING payment to Database
  await prisma.invoice.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      amount: course.courseFee,
      transactionId: tran_id,
      status: 'PENDING',
    },
  });
  

  // 4. Construct SSLCommerz Payload
  const data = {
    total_amount: course.courseFee,
    currency: 'BDT',
    tran_id: tran_id, // Use the unique ID we just created

    // 👉 THESE URLS ARE CRITICAL! SSLCommerz will redirect users here after payment.
    success_url: `http://localhost:5000/api/v1/payments/success/${tran_id}`,
    fail_url: `http://localhost:5000/api/v1/payments/fail/${tran_id}`,
    cancel_url: `http://localhost:5000/api/v1/payments/cancel/${tran_id}`,
    ipn_url: `http://localhost:5000/api/v1/payments/ipn`, // Webhook URL

    shipping_method: 'No',
    product_name: course.title,
    product_category: 'Education',
    product_profile: 'non-physical-goods',

    cus_name: student.user.name,
    cus_email: student.user.email,
    cus_add1: 'Dhaka',
    cus_city: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: '01700000000', // Ideally, pull this from user profile
  };

  // 5. Initialize with SSLCommerz
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  try {
    const apiResponse = await sslcz.init(data);

    // If successful, SSLCommerz gives us a URL to redirect the user to.
    if (apiResponse?.GatewayPageURL) {
      return { url: apiResponse.GatewayPageURL };
    } else {
      throw new AppError(500, 'Failed to generate SSLCommerz gateway URL');
    }
  } catch (error) {
    throw new AppError(500, 'SSLCommerz Initialization Error');
  }
};

export const PaymentServices = {
  createPendingPayment,
  confirmPaymentAndEnroll,
  getMyPayments,
  getAllPayments,
  initPayment,
};
