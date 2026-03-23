import { Request, Response } from 'express';

import { WeeklyReportServices } from './weeklyReport.service';
import { catchAsync } from '../../shared/catchAsync';
import { sendResponse } from '../../shared/sendRespose';

const createWeeklyReport = catchAsync(async (req: Request, res: Response) => {
  const authUserId = req.user?.id as string; // Base Auth ID
  const result = await WeeklyReportServices.createWeeklyReport(authUserId, req.body);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'Weekly report submitted successfully',
    data: result,
  });
});

const getMyReports = catchAsync(async (req: Request, res: Response) => {
  const authUserId = req.user?.id as string; // Base Auth ID
  const result = await WeeklyReportServices.getMyReports(authUserId);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Your reports retrieved successfully',
    data: result,
  });
});

const getCourseReports = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const result = await WeeklyReportServices.getCourseReports(courseId as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Course reports retrieved successfully',
    data: result,
  });
});

export const WeeklyReportControllers = {
  createWeeklyReport,
  getMyReports,
  getCourseReports,
};
