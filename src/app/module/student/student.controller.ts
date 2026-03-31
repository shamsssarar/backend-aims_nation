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
