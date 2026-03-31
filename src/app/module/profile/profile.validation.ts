import { z } from 'zod';

const createStudentProfileSchema = z.object({
  contactNo: z
    .string('Parent contact number is required')
    .max(11, 'Contact number must be at most 15 characters long')
    .optional(),
  schoolGrade: z.string('School grade is required'),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(), // Expecting an ISO date string from the frontend
});

export const ProfileValidations = {
  createStudentProfileSchema,
};
