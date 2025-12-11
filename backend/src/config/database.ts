import { PrismaClient } from '@prisma/client';

// Prisma 6 reads DATABASE_URL from environment automatically
const prisma = new PrismaClient();

export default prisma;

