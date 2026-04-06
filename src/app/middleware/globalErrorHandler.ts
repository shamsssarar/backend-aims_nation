import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { TErrorSources } from '../interfaces/error.interface.js';
import { handleZodError } from '../errorHelpers/handleZodError.js';
import AppError from '../errorHelpers/AppError.js';
// import config from '../config.js'; // Assuming you have an env config file

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Default values
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources[] = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError?.statusCode as number;
    message = simplifiedError?.message;
    errorSources = simplifiedError?.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  // Send the final response
  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    // stack: config.NODE_ENV === 'development' ? err?.stack : null, // Good practice for prod
  });
};

export default globalErrorHandler;
