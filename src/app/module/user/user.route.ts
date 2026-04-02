import express from 'express';
import { userControllers } from './user.controller.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { userValidations } from './user.validation.js';

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

export const UserRoutes = router;
