import express from 'express';
import { TeacherApplicationControllers } from './teacherApplication.controller';

import { TeacherApplicationValidations } from './teacherApplication.validation';
import { validateRequest } from '../../middleware/validateRequest';
import checkAuth from '../../middleware/checkAuth';

const router = express.Router();

// 🌍 PUBLIC: Anyone can submit their CV
router.post(
  '/apply',
  validateRequest(TeacherApplicationValidations.submitApplicationSchema),
  TeacherApplicationControllers.submitApplication
);

// 🔒 ADMIN ONLY: View the talent pool
router.get('/', checkAuth(['ADMIN']), TeacherApplicationControllers.getAllApplications);

// 🔒 ADMIN ONLY: Mark as Reviewed or Rejected
router.patch(
  '/:id/status',
  checkAuth(['ADMIN']),
  validateRequest(TeacherApplicationValidations.updateStatusSchema),
  TeacherApplicationControllers.updateApplicationStatus
);

// 🔒 ADMIN ONLY: The official Hire button
router.post(
  '/:id/hire',
  checkAuth(['ADMIN']),
  validateRequest(TeacherApplicationValidations.hireApplicantSchema),
  TeacherApplicationControllers.hireApplicant
);

export const TeacherApplicationRoutes = router;
