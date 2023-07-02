import Prisma from '@prisma/client';

// Destructure PrismaClient
const { PrismaClient } = Prisma;

// Create new object
const prisma = new PrismaClient();

export { prisma };
