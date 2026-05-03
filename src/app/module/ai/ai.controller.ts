import { Request, Response, NextFunction } from 'express';
import { askTutorService } from './ai.service.js';

export const askTutor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return; // Stop execution here
    }

    // Call the service to do the heavy lifting
    const responseText = await askTutorService(message, history);

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
