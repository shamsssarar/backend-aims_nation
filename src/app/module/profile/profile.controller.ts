import { Request, Response } from 'express';
import { ProfileServices } from './profile.service';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendRespose';

const createStudentProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;

  const result = await ProfileServices.createStudentProfile(userId, req.body);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Profile completed successfully!',
    data: result,
  });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const role = (req.user as any).role; // Grabbing the role from the session

  const result = await ProfileServices.getMyProfile(userId, role);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

export const ProfileControllers = {
  createStudentProfile,
  getMyProfile,
};
