import { z } from 'zod';

const createCourseValidationSchema = z.object({
  body: z.object({
    title: z
      .string({
        error: 'Course title is required',
      })
      .min(3, 'Title must be at least 3 characters long'),
    description: z.string().optional(),
  }),
});

const updateCourseValidationSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters long').optional(),
    description: z.string().optional(),
  }),
});

export const CourseValidations = {
  createCourseValidationSchema,
  updateCourseValidationSchema,
};
