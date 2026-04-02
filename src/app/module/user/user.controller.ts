import { Request, Response } from 'express';
import { catchAsync } from '../../shared/catchAsync.js';
import { sendResponse } from '../../shared/sendRespose.js';
import { userServices } from './user.service.js';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.createUser(req.body);

  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: 'User created successfully',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await userServices.getAllUsers();

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userServices.getUserById(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'User retrieved successfully',
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userServices.updateUser(id as string, req.body);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'User updated successfully',
    data: result,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await userServices.deleteUser(id as string);

  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: 'User deleted successfully',
    data: result,
  });
});

export const userControllers = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
