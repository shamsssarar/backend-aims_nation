import express from 'express';
import { CourseControllers } from './course.controller.js';

import { CourseValidations } from './course.validation.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import checkAuth from '../../middleware/checkAuth.js';

const router = express.Router();

router.post(
  '/',
  checkAuth(['ADMIN']),
  validateRequest(CourseValidations.createCourseValidationSchema),
  CourseControllers.createCourse
);

router.get(
  '/:courseId/roster',
  checkAuth(['TEACHER', 'ADMIN']), // Only Teachers and Admins can see the roster
  CourseControllers.getCourseRoster
);

router.get('/', CourseControllers.getAllCourses);

router.get('/:id', CourseControllers.getCourseById);

router.patch(
  '/:id',
  checkAuth(['ADMIN']),
  validateRequest(CourseValidations.updateCourseValidationSchema),
  CourseControllers.updateCourse
);

router.delete('/:id', checkAuth(['ADMIN']), CourseControllers.deleteCourse);

export const CourseRoutes = router;
