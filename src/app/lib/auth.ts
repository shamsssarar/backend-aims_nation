import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma'; // Your prisma client instance

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'PARENT',
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  // You can configure session limits, JWTs, etc., here later
});
