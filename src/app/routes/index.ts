import { Router } from 'express';
import { CourseRoutes } from '../module/course/course.route';
import { UserRoutes } from '../module/user/user.route';

const router = Router();

router.use('/courses', CourseRoutes);

router.use('/user', UserRoutes);

export const IndexRoutes = router;
