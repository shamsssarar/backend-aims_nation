import express from 'express';
import { StudentControllers } from './student.controller';
import checkAuth from '../../middleware/checkAuth';
import { updateStudentValidationSchema } from './student.validation';
import { validateRequest } from '../../middleware/validateRequest';

const router = express.Router();

// Only Admins (and maybe Teachers later) should see the master roster
router.get('/', checkAuth(['ADMIN']), StudentControllers.getAllStudents);

router.patch(
  '/:id',
  checkAuth(['ADMIN']),
  validateRequest(updateStudentValidationSchema),
  StudentControllers.updateStudent
);

export const StudentRoutes = router;
