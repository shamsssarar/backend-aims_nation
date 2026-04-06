import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { notFound } from './app/middleware/notFound.js';
import globalErrorHandler from './app/middleware/globalErrorHandler.js';
import { IndexRoutes } from './app/routes/index.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './app/lib/auth.js';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true }));

//routes
app.use('/api/v1', IndexRoutes);

//auth
app.use('/api/auth', toNodeHandler(auth));

app.get('/', (req: Request, res: Response) => {
  res.send('AiMS Nation Backend is Live!');
});

// 404 handler (must be placed after all routes)
app.use(notFound);

// Global Error Handler (must be last)
app.use(globalErrorHandler);

export default app;
