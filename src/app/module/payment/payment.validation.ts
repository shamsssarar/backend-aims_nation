import { z } from 'zod';

const createPaymentSchema = z.object({
  courseId: z.string('Coures Id is required'),
});

export const PaymentValidations = { createPaymentSchema };
