// src/module/ai/ai.route.ts
import express from 'express';
import { askTutor } from './ai.controller';

const router = express.Router();

// The endpoint the frontend will hit
router.post('/tutor', askTutor);

export const AiRoutes = router;
