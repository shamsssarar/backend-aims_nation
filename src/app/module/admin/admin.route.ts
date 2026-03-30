import express from 'express';
import { AdminControllers } from './admin.controller';
import checkAuth from '../../middleware/checkAuth';

const router = express.Router();

// Only the Admin can see the master analytics!
router.get(
  '/analytics',
  checkAuth(['ADMIN']),
  AdminControllers.getAnalytics
);

export const AdminRoutes = router;