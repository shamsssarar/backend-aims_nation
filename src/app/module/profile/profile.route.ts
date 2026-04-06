import express from 'express';
import { ProfileControllers } from './profile.controller.js';

import { ProfileValidations } from './profile.validation.js';
import checkAuth from '../../middleware/checkAuth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { upload } from '../../utils/upload.js';

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

router.patch(
  '/me/image',
  checkAuth(['STUDENT', 'TEACHER', 'ADMIN']), // 1. Ensure they are logged in
  upload.single('image'), // 2. Multer intercepts the file
  ProfileControllers.updateProfileImage // 3. Send to the controller
);

export const ProfileRoutes = router;
