import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync.js';
import { StudentServices } from './student.service.js';
import { IQueryParams } from '../../interfaces/query.interface.js';

const getAllStudents = catchAsync(async (req: Request, res: Response) => {
  const result = await StudentServices.getAllStudents(req.query as IQueryParams);

  res.status(200).json({
    success: true,
    message: 'Students retrieved successfully',
    data: result,
  });
});

//update student
const updateStudent = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await StudentServices.updateStudent(id as string, req.body);

  res.status(200).json({
    success: true,
    message: 'Student updated successfully',
    data: result,
  });
});

export const StudentControllers = { getAllStudents, updateStudent };
