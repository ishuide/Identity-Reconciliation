import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDb() {
    console.log('Checking database...');
    try {
        const count = await prisma.contact.count();
        console.log(`Total contacts: ${count}`);
        const all = await prisma.contact.findMany();
        console.log(JSON.stringify(all, null, 2));
    } catch (err) {
        console.error('Error checking DB:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
