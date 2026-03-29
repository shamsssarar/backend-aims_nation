// src/app/module/teacher/teacher.route.ts
import express from 'express';
import { TeacherController } from './teacher.controller';
import checkAuth from '../../middleware/checkAuth'; // Adjust path to your checkAuth

const router = express.Router();

// Only TEACHERS and ADMINS are allowed to view this
router.get(
  '/my-classes',
  checkAuth(['TEACHER', 'ADMIN']),
  TeacherController.getMyClasses
);

export const TeacherRoutes = router;