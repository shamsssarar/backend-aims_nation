import { Router } from 'express';
import { CourseRoutes } from '../module/course/course.route';
import { UserRoutes } from '../module/user/user.route';
import { EnrollmentRoutes } from '../module/enrollment/enrollment.route';
import { PaymentRoutes } from '../module/payment/payment.route';
import { ProfileRoutes } from '../module/profile/profile.route';
import { TeacherApplicationRoutes } from '../module/teacherApplication/teacherApplication.route';

const router = Router();

router.use('/courses', CourseRoutes);

router.use('/user', UserRoutes);

router.use('/enrollments', EnrollmentRoutes);

router.use('/payments', PaymentRoutes);

router.use('/profiles', ProfileRoutes);

router.use('/careers', TeacherApplicationRoutes);

export const IndexRoutes = router;
