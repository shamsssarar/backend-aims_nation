import express from 'express';
import { ProfileControllers } from './profile.controller';

import { ProfileValidations } from './profile.validation';
import checkAuth from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';

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
