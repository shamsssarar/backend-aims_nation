import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendRespose';
import { PaymentServices } from './payment.service';

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

export const PaymentControllers = {
  createPayment,
  confirmPayment,
  getMyPayments,
  getAllPayments,
};
