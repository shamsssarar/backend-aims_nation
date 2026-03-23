import { Router } from 'express';
import { CourseRoutes } from '../module/course/course.route';
import { UserRoutes } from '../module/user/user.route';
import { EnrollmentRoutes } from '../module/enrollment/enrollment.route';
import { PaymentRoutes } from '../module/payment/payment.route';
import { ProfileRoutes } from '../module/profile/profile.route';

const router = Router();

router.use('/courses', CourseRoutes);

router.use('/user', UserRoutes);

router.use('/enrollments', EnrollmentRoutes);

router.use('/payments', PaymentRoutes);

router.use('/profiles', ProfileRoutes);

export const IndexRoutes = router;
