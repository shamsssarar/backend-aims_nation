import dotenv from 'dotenv';
import status from 'http-status';
import AppError from '../errorHelpers/AppError.js';

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  // ACCESS_TOKEN_SECRET: string;
  // REFRESH_TOKEN_SECRET: string;
  // ACCESS_TOKEN_EXPIRES_IN: string;
  // REFRESH_TOKEN_EXPIRES_IN: string;
  // BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: string;
  // BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: string;
  // EMAIL_SENDER:{
  //     SMTP_USER: string;
  //     SMTP_PASS: string;
  //     SMTP_HOST: string;
  //     SMTP_PORT: string;
  //     SMTP_FROM: string;
  // }
  // GOOGLE_CLIENT_ID: string;
  // GOOGLE_CLIENT_SECRET: string;
  // GOOGLE_CALLBACK_URL: string;
  // FRONTEND_URL: string;
  CLOUDINARY: {
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
  sslCommerz: {
    SSLCOMMERZ_STORE_ID: string;
    SSLCOMMERZ_STORE_PASS: string;
    SSLCOMMERZ_IS_LIVE: boolean;
  };
  // STRIPE:{
  //     STRIPE_SECRET_KEY: string;
  //     STRIPE_WEBHOOK_SECRET: string;
  // }
  // SUPER_ADMIN_EMAIL: string;
  // SUPER_ADMIN_PASSWORD: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requireEnvVariable = [
    'NODE_ENV',
    // not forcing PORT/DATABASE_URL/BETTER_AUTH_URL so deployment works with minimal env
  ];

  requireEnvVariable.forEach((variable) => {
    if (!process.env[variable]) {
      // throw new Error(`Environment variable ${variable} is required but not set in .env file.`);
      throw new AppError(
        status.INTERNAL_SERVER_ERROR,
        `Environment variable ${variable} is required but not set in .env file.`
      );
    }
  });

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT || '3000',
    DATABASE_URL: process.env.DATABASE_URL || '',
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || '',
    // ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    // REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    // ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    // REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
    // BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as string,
    // BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as string,
    // EMAIL_SENDER: {
    //     SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
    //     SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
    //     SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
    //     SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT as string,
    //     SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
    // },
    // GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    // GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    // GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
    // FRONTEND_URL: process.env.FRONTEND_URL as string,
    CLOUDINARY: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    },
    sslCommerz: {
      SSLCOMMERZ_STORE_ID: process.env.SSLCOMMERZ_STORE_ID as string,
      SSLCOMMERZ_STORE_PASS: process.env.SSLCOMMERZ_STORE_PASS as string,
      SSLCOMMERZ_IS_LIVE: process.env.SSLCOMMERZ_IS_LIVE === 'true',
    },
    // STRIPE: {
    //     STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
    //     STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
    // },
    // SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL as string,
    // SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD as string,
  };
};

export const envVars = loadEnvVariables();
