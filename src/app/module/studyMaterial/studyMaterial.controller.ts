import { Request, Response } from 'express';

import { StudyMaterialServices } from './studyMaterial.service';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendRespose';
import AppError from '../../errorHelpers/AppError';
import { uploadFileToCloudinary } from '../../utils/cloudinary';

const getMaterialsForCourse = catchAsync(async (req: Request, res: Response) => {
  const authUserId = req.user?.id as string;
  const role = (req.user as any).role?.toUpperCase();
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

const uploadMaterial = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id; // From your auth middleware
  const file = req.file; // This is injected by Multer!
  if (!file) {
    throw new AppError(400, 'Please upload a valid file.');
  }

  const { courseId, title, description } = req.body;

  if (!title) {
    throw new AppError(400, 'Title is required.');
  }
  if (!courseId) {
    throw new AppError(400, 'Course ID is required.');
  }
  const cloudinaryResult = await uploadFileToCloudinary(file.buffer, file.originalname);

  const payload = {
    title,
    description,
    fileUrl: cloudinaryResult.secure_url,
  };

  const result = await StudyMaterialServices.uploadMaterial(userId, courseId, payload);

  res.status(201).json({
    success: true,
    message: 'Material uploaded successfully!',
    data: result,
  });
});

export const StudyMaterialControllers = {
  getMaterialsForCourse,
  deleteStudyMaterial,
  uploadMaterial,
};
