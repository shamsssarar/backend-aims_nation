import express from 'express';
import { EnrollmentControllers } from './enrollment.controller.js';
import { EnrollmentValidations } from './enrollment.validation.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import checkAuth from '../../middleware/checkAuth.js';

const router = express.Router();

router.post(
  '/',
  checkAuth(['ADMIN']),
  validateRequest(EnrollmentValidations.createEnrollmentValidationSchema),
  EnrollmentControllers.createEnrollment
);

router.get('/', checkAuth(['ADMIN', 'TEACHER']), EnrollmentControllers.getAllEnrollments);

router.get('/my-courses', checkAuth(['STUDENT']), EnrollmentControllers.getMyEnrollments);

router.get(
  '/course-roster/:courseId',
  checkAuth(['ADMIN', 'TEACHER']),
  // You will add the corresponding controller for this later
  EnrollmentControllers.getCourseEnrollments
);
// router.get('/:id', checkAuth(['ADMIN', 'TEACHER']), EnrollmentControllers.getEnrollmentById);

// router.patch(
//   '/:id',
//   checkAuth(['ADMIN', 'TEACHER']),
//   validateRequest(EnrollmentValidations.updateEnrollmentValidationSchema),
//   EnrollmentControllers.updateEnrollment
// );

// router.delete('/:id', checkAuth(['ADMIN']), EnrollmentControllers.deleteEnrollment);

export const EnrollmentRoutes = router;
