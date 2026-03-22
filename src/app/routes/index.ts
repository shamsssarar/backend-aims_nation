import { Router } from 'express';
import { CourseRoutes } from '../module/course/course.route';
import { UserRoutes } from '../module/user/user.route';
import { EnrollmentRoutes } from '../module/enrollment/enrollment.route';

const router = Router();

router.use('/courses', CourseRoutes);

router.use('/user', UserRoutes);

router.use('/enrollments', EnrollmentRoutes);

export const IndexRoutes = router;
