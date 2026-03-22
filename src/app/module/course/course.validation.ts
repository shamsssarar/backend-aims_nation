import { z } from 'zod';

const createCourseValidationSchema = z.object({
  title: z.string('Course title is required').min(3, 'Title must be at least 3 characters long'),
  description: z.string().optional(),
  courseFee: z.number(),
});

const updateCourseValidationSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').optional(),
  description: z.string().optional(),
  courseFee: z.number('CourseFee is Required'),
});

export const CourseValidations = {
  createCourseValidationSchema,
  updateCourseValidationSchema,
};
