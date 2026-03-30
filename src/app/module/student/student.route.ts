import express from 'express';
import { StudentControllers } from './student.controller';
import checkAuth from '../../middleware/checkAuth';

const router = express.Router();

// Only Admins (and maybe Teachers later) should see the master roster
router.get(
  '/',
  checkAuth(['ADMIN']),
  StudentControllers.getAllStudents
);

export const StudentRoutes = router;