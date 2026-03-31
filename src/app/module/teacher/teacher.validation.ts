// upadate zod for teahcer
import { z } from 'zod';

export const updateTeacherValidationSchema = z.object({
  contactNo: z.string().max(11, 'Contact number must be at most 11 characters long').optional(),
  salary: z.number().optional(),
});
