import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { notFound } from './app/middleware/notFound';
import globalErrorHandler from './app/middleware/globalErrorHandler';

const app: Application = express();

// Parsers
app.use(express.json());
app.use(cors());

//routes
app.get('/', (req: Request, res: Response) => {
  res.send('AiMS Nation Server is running 🚀');
});

// Global Error Handler (Must be after all routes)
app.use(globalErrorHandler);

app.use(notFound);

export default app;
