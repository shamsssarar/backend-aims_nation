import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma.js'; // Your prisma client instance
import bcrypt from 'bcryptjs';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  baseURL: process.env.BETTER_AUTH_URL as string, // Your backend URL
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'STUDENT',
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    password: {
      // 👈 Tell better-auth how to hash and verify using bcrypt
      hash: async (password) => {
        return await bcrypt.hash(password, 10);
      },
      verify: async ({ hash, password }) => {
        return await bcrypt.compare(password, hash);
      },
    },
  },

  trustedOrigins: [(process.env.FRONTEND_URL as string) || (process.env.BETTER_AUTH_URL as string)], // Allow CORS for our frontend

  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // 'user' is the newly created User record from better-auth
          // We immediately generate their Student profile!
          await prisma.student.create({
            data: {
              userId: user.id,
              // Add any default Student fields here if your schema requires them
            },
          });
        },
      },
    },
  },
  // You can configure session limits, JWTs, etc., here later
});
