import { Request, Response, NextFunction } from 'express';
import { askTutorService, askTutorPublicService } from './ai.service.js';

export const askTutor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, history, courseId } = req.body;

    if (!message) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return; // Stop execution here
    }

    // Ensure authentication has populated req.user via checkAuth
    const authUser = (req as any).user;
    if (!authUser || !authUser.id) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    // Call the service to do the heavy lifting with explicit course context and user
    const responseText = await askTutorService(message, history, courseId ?? null, authUser);

    // Send the clean response back to the frontend EXACTLY ONCE
    res.status(200).json({
      success: true,
      data: responseText,
    });
    return; // Close the request cleanly
  } catch (error) {
    console.error('🚨 [AI ERROR]:', error);
    // Pass fatal errors to your Express global error handler
    next(error);
  }
};

export const askTutorPublic = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, courseId } = req.body;

    if (!message) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    if (!courseId) {
      res.status(400).json({ success: false, error: 'Course ID is required for public queries' });
      return;
    }

    // Call the public service which MUST NOT use the vector store — only course metadata
    const responseText = await askTutorPublicService(message, courseId as string);

    res.status(200).json({ success: true, data: responseText });
    return;
  } catch (error) {
    console.error('🚨 [AI PUBLIC ERROR]:', error);
    next(error);
  }
};