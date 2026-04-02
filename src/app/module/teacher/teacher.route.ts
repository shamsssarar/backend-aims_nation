// src/app/module/teacher/teacher.route.ts
import express from 'express';
import { TeacherController } from './teacher.controller.js';
import checkAuth from '../../middleware/checkAuth.js'; // Adjust path to your checkAuth

const router = express.Router();

// Only TEACHERS and ADMINS are allowed to view this
router.get('/my-classes', checkAuth(['TEACHER', 'ADMIN']), TeacherController.getMyClasses);

router.get(
  '/',
  checkAuth(['ADMIN']), // Only Admins need the full list of teachers to assign them
  TeacherController.getAllTeachers
);

router.patch(
  '/:id',
  checkAuth(['ADMIN']), // Only Admins can edit teacher profiles
  TeacherController.updateTeacher
);

export const TeacherRoutes = router;
