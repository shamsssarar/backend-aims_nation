import express from 'express';
import { PaymentControllers } from './payment.controller.js';
import checkAuth from '../../middleware/checkAuth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { PaymentValidations } from './payment.validation.js';
import { auth } from '../../lib/auth.js';

const router = express.Router();

// 1. STUDENT requests to buy a course
router.post(
  '/buy',
  checkAuth(['STUDENT']),
  validateRequest(PaymentValidations.createPaymentSchema),
  PaymentControllers.createPayment
);

// 2. STUDENT views their own billing history
router.get('/my-payments', checkAuth(['STUDENT']), PaymentControllers.getMyPayments);

// 3. ADMIN views all pending/paid payments
router.get('/', checkAuth(['ADMIN']), PaymentControllers.getAllPayments);

// 4. ADMIN approves payment (The Magic Button)
router.patch('/:id/confirm', checkAuth(['ADMIN']), PaymentControllers.confirmPayment);

router.post('/init', checkAuth(['STUDENT']), PaymentControllers.initPayment);

router.post('/success/:tranId', PaymentControllers.paymentSuccess);
router.post('/fail/:tranId', PaymentControllers.paymentFail);
router.post('/cancel/:tranId', PaymentControllers.paymentCancel);

export const PaymentRoutes = router;
