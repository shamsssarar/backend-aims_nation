import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from './prisma'; // Your prisma client instance
import bcrypt from 'bcryptjs';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
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

  trustedOrigins: ['http://localhost:3000'],

  // You can configure session limits, JWTs, etc., here later
});
