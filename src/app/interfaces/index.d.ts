declare global {
  namespace Express {
    interface Request {
      user?: any; // We use 'any' for now, but you can replace this with your Prisma User type later!
    }
  }
}

// This empty export is absolutely crucial. 
// It tells TypeScript to treat this file as a module so the global declaration works.
export {};