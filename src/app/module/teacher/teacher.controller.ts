// src/app/module/teacher/teacher.controller.ts
import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync'; // Adjust path if needed
import { TeacherServices } from './teacher.service';

const getMyClasses = catchAsync(async (req: Request, res: Response) => {
  // Grab the User ID from your checkAuth middleware
  const userId = (req as any).user.id;

  const result = await TeacherServices.getMyClasses(userId);

  res.status(200).json({
    success: true,
    message: 'Teacher classes retrieved successfully',
    data: result,
  });
});

export const TeacherController = {
  getMyClasses,
};