// src/module/ai/ai.route.ts
import express from 'express';
import { askTutor, askTutorPublic } from './ai.controller.js';
import checkAuth from '../../middleware/checkAuth.js';

const router = express.Router();

// The endpoint the frontend will hit — require authentication and role
router.post('/ask', checkAuth(['STUDENT','TEACHER','ADMIN']), askTutor);

// Public AI endpoint that returns short answers using ONLY public course metadata
router.post('/public-ask', askTutorPublic);

export const AiRoutes = router;
