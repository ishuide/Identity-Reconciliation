import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reset() {
    console.log('Resetting database...');
    await prisma.contact.deleteMany({});
    console.log('Database cleared.');
    await prisma.$disconnect();
}

reset();
