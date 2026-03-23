import express from 'express';
import { WeeklyReportControllers } from './weeklyReport.controller';

import { WeeklyReportValidations } from './weeklyReport.validation';
import checkAuth from '../../middleware/checkAuth';
import { validateRequest } from '../../middleware/validateRequest';

const router = express.Router();

// 🔒 Only Teachers and Admins can grade a student
router.post(
  '/',
  checkAuth(['ADMIN', 'TEACHER']),
  validateRequest(WeeklyReportValidations.createWeeklyReportSchema),
  WeeklyReportControllers.createWeeklyReport
);

// 🔒 Students can see their own report card
router.get('/my-reports', checkAuth(['STUDENT']), WeeklyReportControllers.getMyReports);

// 🔒 Teachers can view the history of reports they've submitted for a class
router.get(
  '/course/:courseId',
  checkAuth(['ADMIN', 'TEACHER']),
  WeeklyReportControllers.getCourseReports
);

export const WeeklyReportRoutes = router;
