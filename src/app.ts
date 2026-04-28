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
  const frontendUrl = process.env.FRONTEND_URL || 'https://aims-nation-frontend.vercel.app';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AiMS Nation API</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f8fafc;
        }
        .container {
          text-align: center;
          background: white;
          padding: 3.5rem 4rem;
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          /* Primary Color border */
          border-top: 6px solid oklch(0.495 0.085 131.2); 
        }
        h1 {
          /* Primary Color */
          color: oklch(0.495 0.085 131.2); 
          margin-top: 0;
          margin-bottom: 0.5rem;
          font-size: 2.5rem;
          letter-spacing: -0.025em;
        }
        p {
          color: #64748b;
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          /* Secondary Color */
          background-color: oklch(0.745 0.165 85.5); 
          color: #1e293b; 
          padding: 0.5rem 1rem;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.875rem;
          margin-bottom: 2.5rem;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #16a34a; 
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(22, 163, 74, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(22, 163, 74, 0); }
        }
        .btn {
          display: inline-block;
          /* Primary Color */
          background-color: oklch(0.495 0.085 131.2); 
          color: white;
          text-decoration: none;
          padding: 0.875rem 1.75rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          opacity: 0.9;
        }
        .divider {
          height: 1px;
          background-color: #e2e8f0;
          margin: 2rem 0;
          width: 100%;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>AiMS Nation</h1>
        <p>Backend API Services</p>
        
        <div class="badge">
          <div class="pulse-dot"></div>
          System is Live and Running
        </div>

        <div class="divider"></div>

        <a href="${frontendUrl}" class="btn">
          Go to Frontend Portal &rarr;
        </a>
      </div>
    </body>
    </html>
  `;

  res.send(html);
});

// 404 handler (must be placed after all routes)
app.use(notFound);

// Global Error Handler (must be last)
app.use(globalErrorHandler);

export default app;
