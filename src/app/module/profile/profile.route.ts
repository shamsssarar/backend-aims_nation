import express from 'express';
import { ProfileControllers } from './profile.controller.js';

import { ProfileValidations } from './profile.validation.js';
import checkAuth from '../../middleware/checkAuth.js';
import { validateRequest } from '../../middleware/validateRequest.js';

const router = express.Router();

// 1. The Onboarding Submission
router.post(
  '/setup-student',
  checkAuth(['STUDENT']),
  validateRequest(ProfileValidations.createStudentProfileSchema),
  ProfileControllers.createStudentProfile
);

// 2. Fetching the combined profile data
router.get('/me', checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), ProfileControllers.getMyProfile);

export const ProfileRoutes = router;
