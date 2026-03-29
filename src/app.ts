import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { notFound } from './app/middleware/notFound';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import { IndexRoutes } from './app/routes';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './app/lib/auth';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000', // Adjust this to your frontend URL
    credentials: true, // Allow cookies to be sent
  })
);
app.use(express.urlencoded({ extended: true }));

//routes
app.use('/api/v1', IndexRoutes);

//auth
app.use('/api/auth', toNodeHandler(auth));

// 404 handler (must be placed after all routes)
app.use(notFound);

// Global Error Handler (must be last)
app.use(globalErrorHandler);

export default app;
