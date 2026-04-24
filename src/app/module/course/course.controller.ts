import { Request, Response } from 'express';

import { CourseServices } from './course.service.js';
import { catchAsync } from '../../shared/catchAsync.js';
import { sendResponse } from '../../shared/sendRespose.js';
import { IQueryParams } from '../../interfaces/query.interface.js';

const createCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseServices.createCourse(req.body);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Course created successfully',
    data: result,
  });
});

const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseServices.getAllCourses(req.query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Courses retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CourseServices.getCourseById(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Course retrieved successfully',
    data: result,
  });
});

const getCourseRoster = catchAsync(async (req: Request, res: Response) => {
  // 1. Grab the Teacher's ID from the Auth Middleware
  // (Depending on your JWT payload, this might be req.user.id or req.user.userId)
  const userId = (req as any).user.id;

  // 2. Grab the Course ID from the URL parameters (e.g., /api/v1/courses/:courseId/roster)
  const { courseId } = req.params;

  // 3. Hand off to the Service we just built
  const result = await CourseServices.getCourseRoster(userId, courseId as string);

  // 4. Send the perfectly formatted array back to the frontend
  res.status(200).json({
    success: true,
    message: 'Course roster retrieved successfully!',
    data: result,
  });
});

const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CourseServices.updateCourse(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Course updated successfully',
    data: result,
  });
});

const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await CourseServices.deleteCourse(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Course deleted successfully',
    data: result,
  });
});

export const CourseControllers = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseRoster,
};
