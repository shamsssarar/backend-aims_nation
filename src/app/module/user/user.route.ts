import express from 'express';
import { userControllers } from './user.controller';
import { validateRequest } from '../../middleware/validateRequest';
import { userValidations } from './user.validation';

const router = express.Router();

router.post(
  '/',
  validateRequest(userValidations.createUserValidationSchema),
  userControllers.createUser
);

router.get('/', userControllers.getAllUsers);

router.get('/:id', userControllers.getUserById);

router.patch(
  '/:id',
  validateRequest(userValidations.updateUserValidationSchema),
  userControllers.updateUser
);

router.delete('/:id', userControllers.deleteUser);

export default router;
