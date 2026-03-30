import { z } from 'zod';

const createStudyMaterialSchema = z.object({
  title: z.string('Title is required'),
  description: z.string().optional(),
  fileUrl: z.string('File URL is required'),
  courseId: z.string('Course ID is required'),
});

const uploadMaterialSchema = z.object({
  title: z.string('Title is required'),
  courseId: z.string('Course ID is required'),
  description: z.string().optional(),
});

export const StudyMaterialValidations = {
  createStudyMaterialSchema,
  uploadMaterialSchema,
};
