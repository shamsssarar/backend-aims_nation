import express from 'express';
import { CourseControllers } from './course.controller';

import { CourseValidations } from './course.validation';
import { validateRequest } from '../../middleware/validateRequest';
import checkAuth from '../../middleware/checkAuth';

const router = express.Router();

router.post(
  '/',
  checkAuth(['ADMIN']),
  validateRequest(CourseValidations.createCourseValidationSchema),
  CourseControllers.createCourse
);

router.get('/', CourseControllers.getAllCourses);

router.get('/:id', CourseControllers.getCourseById);

router.patch(
  '/:id',
  checkAuth(['ADMIN']),
  validateRequest(CourseValidations.updateCourseValidationSchema),
  CourseControllers.updateCourse
);

router.delete('/:id', CourseControllers.deleteCourse);

export const CourseRoutes = router;
