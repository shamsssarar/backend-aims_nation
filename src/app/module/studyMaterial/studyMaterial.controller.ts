import { Request, Response } from 'express';

import { StudyMaterialServices } from './studyMaterial.service';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendRespose';

const createStudyMaterial = catchAsync(async (req: Request, res: Response) => {
  const authUserId = req.user?.id as string;
  const result = await StudyMaterialServices.createStudyMaterial(authUserId, req.body);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Study material uploaded successfully',
    data: result,
  });
});

const getMaterialsForCourse = catchAsync(async (req: Request, res: Response) => {
  const authUserId = req.user?.id as string;
  const role = (req.user as any).role;
  const { courseId } = req.params;

  let result;
  // Route logic based on who is asking
  if (role === 'STUDENT') {
    result = await StudyMaterialServices.getMaterialsForStudent(authUserId, courseId as string);
  } else {
    // Admins and Teachers bypass the enrollment check
    result = await StudyMaterialServices.getMaterialsForCourseTeacher(courseId as string);
  }

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Materials retrieved successfully',
    data: result,
  });
});

const deleteStudyMaterial = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StudyMaterialServices.deleteStudyMaterial(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Material deleted successfully',
    data: result,
  });
});

export const StudyMaterialControllers = {
  createStudyMaterial,
  getMaterialsForCourse,
  deleteStudyMaterial,
};
