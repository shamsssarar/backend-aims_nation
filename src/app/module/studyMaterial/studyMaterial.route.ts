import express from 'express';
import { StudyMaterialControllers } from './studyMaterial.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { StudyMaterialValidations } from './studyMaterial.validation';

import checkAuth from '../../middleware/checkAuth';

const router = express.Router();

// 🔒 TEACHER/ADMIN ONLY: Upload a file
router.post(
  '/',
  checkAuth(['ADMIN', 'TEACHER']),
  validateRequest(StudyMaterialValidations.createStudyMaterialSchema),
  StudyMaterialControllers.createStudyMaterial
);

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

export const StudyMaterialRoutes = router;
