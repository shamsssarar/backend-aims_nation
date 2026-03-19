import { User } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';

const createUser = async (payload: { name: string; email: string }): Promise<User> => {
  const result = await prisma.user.create({
    data: payload,
  });
  return result;
};

const getAllUsers = async (): Promise<User[]> => {
  const result = await prisma.user.findMany();
  return result;
};

const getUserById = async (id: string): Promise<User | null> => {
  const result = await prisma.user.findUnique({
    where: { id },
  });
  return result;
};

const updateUser = async (
  id: string,
  payload: Partial<{ name: string; email: string }>
): Promise<User> => {
  const result = await prisma.user.update({
    where: { id },
    data: payload,
  });
  return result;
};

const deleteUser = async (id: string): Promise<User> => {
  const result = await prisma.user.delete({
    where: { id },
  });
  return result;
};

export const userServices = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
