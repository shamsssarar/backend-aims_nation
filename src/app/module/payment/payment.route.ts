import express from 'express';
import { PaymentControllers } from './payment.controller';
import checkAuth from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';
import { PaymentValidations } from './payment.validation';


const router = express.Router();

// 1. STUDENT requests to buy a course
router.post(
  '/buy',
  checkAuth(['STUDENT']),
  validateRequest(PaymentValidations.createPaymentSchema),
  PaymentControllers.createPayment
);

// 2. STUDENT views their own billing history
router.get(
  '/my-payments',
  checkAuth(['STUDENT']),
  PaymentControllers.getMyPayments
);

// 3. ADMIN views all pending/paid payments
router.get(
  '/',
  checkAuth(['ADMIN']),
  PaymentControllers.getAllPayments
);

// 4. ADMIN approves payment (The Magic Button)
router.patch(
  '/:id/confirm',
  checkAuth(['ADMIN']),
  PaymentControllers.confirmPayment
);

export const PaymentRoutes = router;