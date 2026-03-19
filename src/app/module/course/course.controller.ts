import { Request, Response } from 'express';

import { CourseServices } from './course.service';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendRespose';

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
  const result = await CourseServices.getAllCourses();

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Courses retrieved successfully',
    data: result,
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
};
