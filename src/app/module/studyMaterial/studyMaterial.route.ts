import express from 'express';
import { StudyMaterialControllers } from './studyMaterial.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { StudyMaterialValidations } from './studyMaterial.validation.js';

import checkAuth from '../../middleware/checkAuth.js';
import { upload } from '../../utils/upload.js';

const router = express.Router();

// 🔒 EVERYONE: Get files for a course (Controller handles the security logic)
router.get(
  '/:courseId',
  checkAuth(['ADMIN', 'TEACHER', 'STUDENT']),
  StudyMaterialControllers.getMaterialsForCourse
);

// 🔒 TEACHER/ADMIN ONLY: Remove an outdated file
router.delete(
  '/:id',
  checkAuth(['ADMIN', 'TEACHER']),
  StudyMaterialControllers.deleteStudyMaterial
);

router.post(
  '/',
  checkAuth(['TEACHER']),
  // 1st: Multer grabs the file and populates req.body
  upload.single('file'),
  // 2nd: Zod checks the newly populated req.body

  // 3rd: Controller saves to database
  StudyMaterialControllers.uploadMaterial
);

export const StudyMaterialRoutes = router;
