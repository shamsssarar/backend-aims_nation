import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { catchAsync } from '../../shared/catchAsync.js';
import { sendResponse } from '../../shared/sendRespose.js';
import { PaymentServices } from './payment.service.js';
import { prisma } from '../../lib/prisma.js';

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id as string;
  const { courseId, paymentMethod, transactionId } = req.body;

  const result = await PaymentServices.createPendingPayment(
    studentId,
    courseId,
    paymentMethod,
    transactionId
  );

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Purchase request submitted. Waiting for admin approval.',
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // The invoice ID
  const result = await PaymentServices.confirmPaymentAndEnroll(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Payment confirmed and student successfully enrolled!',
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id as string;
  const result = await PaymentServices.getMyPayments(studentId);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Your invoices retrieved successfully',
    data: result,
  });
});

const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.getAllPayments();

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'All system invoices retrieved successfully',
    data: result,
  });
});

const initPayment = catchAsync(async (req: Request, res: Response) => {
  // Assuming your auth middleware attaches the user to req.user
  // If you pass it via the body from the frontend, use req.body.studentId instead
  const authUserId = req.user.id;
  const { courseId } = req.body;

  const result = await PaymentServices.initPayment(authUserId, courseId);

  res.status(200).json({
    success: true,
    message: 'Payment initialized successfully',
    data: result, // This contains the GatewayPageURL
  });
});

const paymentSuccess = catchAsync(async (req: Request, res: Response) => {
  const { tranId } = req.params as { tranId: string };

  // 1. Update the Invoice status to PAID in the database
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Update the Invoice and return the updated record
    const updatedInvoice = await tx.invoice.update({
      where: { transactionId: tranId },
      data: {
        status: 'PAID',
        paymentDate: new Date(),
      },
    });

    // 2. Safety Check: Ensure they aren't already enrolled (prevents duplicates if SSLCommerz fires twice)
    const existingEnrollment = await tx.enrollment.findFirst({
      where: {
        studentId: updatedInvoice.studentId,
        courseId: updatedInvoice.courseId,
      },
    });

    // 3. Create the active enrollment
    if (!existingEnrollment) {
      await tx.enrollment.create({
        data: {
          studentId: updatedInvoice.studentId,
          courseId: updatedInvoice.courseId,
          status: 'ACTIVE',
        },
      });
    }
  });

  // 2. Redirect user to your frontend success page
  res.redirect(`http://localhost:3000/payments/success?transactionId=${tranId}`);
});

const paymentFail = catchAsync(async (req: Request, res: Response) => {
  const { tranId } = req.params as { tranId: string };

  // 1. Update the Invoice status to FAILED in the database
  await prisma.invoice.update({
    where: {
      transactionId: tranId,
    },
    data: {
      status: 'FAILED', // Match your enum
    },
  });

  // 2. Redirect user to your frontend fail page
  res.redirect(`http://localhost:3000/payments/fail?transactionId=${tranId}`);
});

const paymentCancel = catchAsync(async (req: Request, res: Response) => {
  const { tranId } = req.params as { tranId: string };

  await prisma.invoice.update({
    where: {
      transactionId: tranId,
    },
    data: {
      status: 'CANCELLED', // Match your enum
    },
  });

  // Redirect user back to home or cart
  res.redirect(`http://localhost:3000/payments/cancel`);
});

export const PaymentControllers = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getAllPayments,
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
};
