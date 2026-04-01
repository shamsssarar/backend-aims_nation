import { z } from 'zod';

const createPaymentSchema = z.object({
  courseId: z.string('Coures Id is required'),
  transactionId: z.string('Transaction ID is required'),
  paymentMethod: z.string('Payment method is required').optional(),
});

export const PaymentValidations = { createPaymentSchema };
