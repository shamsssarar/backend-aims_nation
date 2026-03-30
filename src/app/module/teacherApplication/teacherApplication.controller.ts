import { Request, Response } from 'express';

import { TeacherApplicationServices } from './teacherApplication.service';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendRespose';

const submitApplication = catchAsync(async (req: Request, res: Response) => {
  const result = await TeacherApplicationServices.submitApplication(req.body);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Application submitted successfully! We will contact you soon.',
    data: result,
  });
});

const getAllApplications = catchAsync(async (req: Request, res: Response) => {
  const result = await TeacherApplicationServices.getAllApplications();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'All teacher applications retrieved successfully',
    data: result,
  });
});

const updateApplicationStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await TeacherApplicationServices.updateApplicationStatus(id as string, status);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: `Application status updated to ${status}`,
    data: result,
  });
});

const getApplicationById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TeacherApplicationServices.getApplicationById(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Application retrieved successfully',
    data: result,
  });
});

const hireApplicant = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // The Application ID

  const result = await TeacherApplicationServices.hireApplicant(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Teacher officially hired and system access granted!',
    data: result,
  });
});

export const TeacherApplicationControllers = {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  hireApplicant,
};
