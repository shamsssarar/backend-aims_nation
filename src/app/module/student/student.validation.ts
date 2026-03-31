// zod validtion for update students

import { z } from 'zod';

export const updateStudentValidationSchema = z.object({
  contactNo: z.string().max(11, 'Contact number must be at most 11 characters long').optional(),
  bloodGroup: z.string().optional(),
});
