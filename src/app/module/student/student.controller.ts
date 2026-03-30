import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync';
import { StudentServices } from './student.service';

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentServices.getAllStudents();

  res.status(200).json({
    success: true,
    message: 'Students retrieved successfully',
    data: result,
  });
});

export const StudentControllers = { getAllStudents };
