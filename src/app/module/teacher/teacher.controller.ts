// src/app/module/teacher/teacher.controller.ts
import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync'; // Adjust path if needed
import { TeacherServices } from './teacher.service';
import AppError from '../../errorHelpers/AppError';

const getMyClasses = catchAsync(async (req: Request, res: Response) => {
  // Grab the User ID from your checkAuth middleware
  const userId = (req as any).user?.id;
  if (!userId) {
    throw new AppError(401, 'Unauthorized: No user ID found.');
  }
  const result = await TeacherServices.getMyClasses(userId);

  res.status(200).json({
    success: true,
    message: 'Teacher classes retrieved successfully',
    data: result,
  });
});

const getAllTeachers = catchAsync(async (req: Request, res: Response) => {
  const result = await TeacherServices.getAllTeachers();

  res.status(200).json({
    success: true,
    message: 'Teachers retrieved successfully',
    data: result,
  });
});

const updateTeacher = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TeacherServices.updateTeacher(id as string, req.body);

  res.status(200).json({
    success: true,
    message: 'Teacher profile updated successfully',
    data: result,
  });
});

// Export it

export const TeacherController = {
  getMyClasses,
  getAllTeachers,
  updateTeacher,
};
