import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync.js';
import { AdminServices } from './admin.service.js';

const getAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminServices.getDashboardAnalytics();

  res.status(200).json({
    success: true,
    message: 'Admin analytics retrieved successfully',
    data: result,
  });
});

export const AdminControllers = { getAnalytics };
