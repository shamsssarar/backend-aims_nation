import { z } from 'zod';

const createEnrollmentValidationSchema = z.object({
  studentId: z.string('Student ID is required'),
  courseId: z.string('Course ID is required'),
});

const updateEnrollmentValidationSchema = z.object({
  status: z.enum(['ACTIVE', 'DROPPED', 'COMPLETED']).optional(),
});

export const EnrollmentValidations = {
  createEnrollmentValidationSchema,
  updateEnrollmentValidationSchema,
};
