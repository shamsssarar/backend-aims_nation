import { z } from 'zod';

const createStudentProfileSchema = z.object({
  parentContactNumber: z.string('Parent contact number is required'),
  schoolGrade: z.string('School grade is required'),
  address: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(), // Expecting an ISO date string from the frontend
});

export const ProfileValidations = {
  createStudentProfileSchema,
};
