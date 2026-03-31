import { z } from 'zod';
import { es } from 'zod/locales';

const submitApplicationSchema = z.object({
  name: z.string('Name is required'),
  email: z.string('Email is required'),
  phone: z.string('Phone number is required'),
  specialty: z.string('Specialty (e.g., Robotics, Cooking) is required'),
  experience: z.string('Experience details are required').optional(),
  resumeLink: z.string('Resume link is required'),
  message: z.string().optional(),
});

// Admin might want to just update the status (e.g., to REVIEWED or REJECTED)
const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'REVIEWED', 'HIRED', 'REJECTED']),
});

const hireApplicantSchema = z.object({
  salary: z.number('Starting salary is required').min(0),
  bio: z.string().optional(),
});

export const TeacherApplicationValidations = {
  submitApplicationSchema,
  updateStatusSchema,
  hireApplicantSchema,
};
