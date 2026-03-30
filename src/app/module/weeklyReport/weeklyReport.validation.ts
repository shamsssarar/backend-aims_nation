import { z } from 'zod';

const createWeeklyReportSchema = z.object({
  studentId: z.string('Student ID is required'),
  courseId: z.string('Course ID is required'),
  weekStartDate: z.string('Week start date is required'), // Must be an ISO date string
  daysPresent: z.number().int().min(0),
  daysAbsent: z.number().int().min(0),
  examScore: z.number().min(0).max(100).optional(),
  behaviorStatus: z.enum(['EXCEPTIONAL', 'NORMAL', 'NEEDS_IMPROVEMENT']).optional(),
  teacherComments: z.string().optional(),
});

export const WeeklyReportValidations = { createWeeklyReportSchema };


