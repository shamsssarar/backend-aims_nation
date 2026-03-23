import { z } from 'zod';

const createStudyMaterialSchema = z.object({
  title: z.string('Title is required'),
  description: z.string().optional(),
  fileUrl: z.string('File URL is required').url('Must be a valid URL'),
  courseId: z.string('Course ID is required'),
});

export const StudyMaterialValidations = {
  createStudyMaterialSchema,
};
