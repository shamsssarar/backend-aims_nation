// src/module/ai/ai.controller.ts
import { Request, Response } from 'express';
import { askTutorService } from './ai.service';

export const askTutor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Call the service to do the heavy lifting
    const responseText = await askTutorService(message, history);

    // Send the clean response back to the frontend
    res.status(200).json({
      success: true,
      reply: responseText,
    });
  } catch (error) {
    console.error('AI Tutor Controller Error:', error);
    res.status(500).json({ error: 'Failed to communicate with the AI Tutor.' });
  }
};
