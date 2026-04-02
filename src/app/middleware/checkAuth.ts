import { NextFunction, Request, Response } from 'express';
import { auth } from '../lib/auth.js';
import AppError from '../errorHelpers/AppError.js';
import { catchAsync } from '../shared/catchAsync.js';

// We pass the allowed roles as an array (e.g., authGuard(['ADMIN', 'TEACHER']))
const checkAuth = (requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get the session from the incoming request headers using better-auth
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session || !session.user) {
      throw new AppError(401, 'You are not authorized to access this route');
    }

    // 2. Check if the user's role matches the required roles
    // Note: Because 'role' is a custom field we added to the User model,
    // we check it here.
    const userRole = (session.user as any).role;

    if (requiredRoles.length && !requiredRoles.includes(userRole)) {
      throw new AppError(403, 'You do not have permission to perform this action');
    }

    // 3. Attach the user to the request object so the controller can use it!
    req.user = session.user;

    next();
  });
};

export default checkAuth;
