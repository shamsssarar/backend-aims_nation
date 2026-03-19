import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { notFound } from './app/middleware/notFound';
import globalErrorHandler from './app/middleware/globalErrorHandler';
import { IndexRoutes } from './app/routes';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());

//routes
app.use('/api/v1', IndexRoutes);

// Global Error Handler (Must be after all routes)
app.use(globalErrorHandler);

app.use(notFound);

export default app;
