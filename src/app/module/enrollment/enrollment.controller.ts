import { Request, Response } from 'express';
import { EnrollmentServices } from './enrollment.service.js';
import { catchAsync } from '../../shared/catchAsync.js';
import { sendResponse } from '../../shared/sendRespose.js';
import AppError from '../../errorHelpers/AppError.js';
import { IQueryParams } from '../../interfaces/query.interface.js';

const createEnrollment = catchAsync(async (req: Request, res: Response) => {
  const result = await EnrollmentServices.createEnrollment(req.body);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Enrollment created successfully',
    data: result,
  });
});

const getAllEnrollments = catchAsync(async (req: Request, res: Response) => {
  const query = { ...req.query };

  // 👉 2. Inject the logged-in student's ID into the query object.
  // The QueryBuilder's .filter() method will automatically catch this!
  if (req.user?.id) {
    query.studentId = req.user.id;
  }
  const result = await EnrollmentServices.getAllEnrollments(query as IQueryParams);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Enrollments retrieved successfully',
    data: result,
  });
});

const getMyEnrollments = catchAsync(async (req: Request, res: Response) => {
  // We get the student's ID securely from the session token, NOT the body!
  const studentId = req.user?.id as string;

  if (!studentId) {
    throw new AppError(401, 'You must be logged in to view your courses.');
  }

  const result = await EnrollmentServices.getMyEnrollments(studentId);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Your enrolled courses retrieved successfully',
    data: result,
  });
});
const getCourseEnrollments = catchAsync(async (req: Request, res: Response) => {
  // We get the courseId from the URL parameter (e.g., /course-roster/12345)
  const { courseId } = req.params;

  const result = await EnrollmentServices.getCourseEnrollments(courseId as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Course roster retrieved successfully',
    data: result,
  });
});
// const getEnrollmentById = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const result = await EnrollmentServices.getEnrollmentById(id as string);

//   sendResponse(res, {
//     httpStatusCode: 200,
//     success: true,
//     message: 'Enrollment retrieved successfully',
//     data: result,
//   });
// });

// const updateEnrollment = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const result = await EnrollmentServices.updateEnrollment(id as string, req.body);

//   sendResponse(res, {
//     httpStatusCode: 200,
//     success: true,
//     message: 'Enrollment updated successfully',
//     data: result,
//   });
// });

// const deleteEnrollment = catchAsync(async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const result = await EnrollmentServices.deleteEnrollment(id as string);

//   sendResponse(res, {
//     httpStatusCode: 200,
//     success: true,
//     message: 'Enrollment deleted successfully',
//     data: result,
//   });
// });

export const EnrollmentControllers = {
  createEnrollment,
  getAllEnrollments,
  getMyEnrollments,
  getCourseEnrollments,
  //   getEnrollmentById,
  //   updateEnrollment,
  //   deleteEnrollment,
};
