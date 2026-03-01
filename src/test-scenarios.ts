import { PrismaClient } from '@prisma/client';
import { identifyContact } from './services/reconciliation';

const prisma = new PrismaClient();

async function runScenarioTests() {
    console.log('--- STARTING USER-SPECIFIED TEST SCENARIOS ---');

    // Case 1: New User (Initial Entry)
    console.log('\n--- Case 1: New User (Initial Entry) ---');
    const res1 = await identifyContact("marty@mcfly.com", "5550199");
    console.log('Input: { "email": "marty@mcfly.com", "phoneNumber": "5550199" }');
    console.log('Response:', JSON.stringify(res1, null, 2));

    // Case 2: Existing User (Secondary Creation)
    console.log('\n--- Case 2: Existing User (Secondary Creation) ---');
    const res2 = await identifyContact("calvin.klein@mcfly.com", "5550199");
    console.log('Input: { "email": "calvin.klein@mcfly.com", "phoneNumber": "5550199" }');
    console.log('Response:', JSON.stringify(res2, null, 2));

    // Case 3: Primary Merge (Two Primaries become One)
    console.log('\n--- Case 3: Primary Merge (Two Primaries become One) ---');

    // Pre-setup for Case 3
    console.log('Setting up Pre-existing Database State for Case 3...');
    const contactA = await prisma.contact.create({
        data: { email: "doc@brown.com", phoneNumber: "1111", linkPrecedence: "primary" }
    });
    const contactB = await prisma.contact.create({
        data: { email: "einstein@dog.com", phoneNumber: "2222", linkPrecedence: "primary" }
    });
    console.log(`Created Contact A (ID: ${contactA.id}) and Contact B (ID: ${contactB.id}) as primaries.`);

    console.log('Sending Request: { "email": "doc@brown.com", "phoneNumber": "2222" }');
    const res3 = await identifyContact("doc@brown.com", "2222");
    console.log('Response:', JSON.stringify(res3, null, 2));

    // Case 4: Partial Match (No New Info)
    console.log('\n--- Case 4: Partial Match (No New Info) ---');
    const res4 = await identifyContact("marty@mcfly.com", "5550199");
    console.log('Input: { "email": "marty@mcfly.com", "phoneNumber": "5550199" }');
    console.log('Response:', JSON.stringify(res4, null, 2));

    // Test Data Table Summary Cases
    console.log('\n--- Test Data Table Summary Cases ---');

    console.log('Scenario: user1@test.com / 12345 (New Primary)');
    const res5 = await identifyContact("user1@test.com", "12345");
    console.log(JSON.stringify(res5, null, 2));

    console.log('Scenario: user1@test.com / 67890 (New Secondary linking to user1)');
    const res6 = await identifyContact("user1@test.com", "67890");
    console.log(JSON.stringify(res6, null, 2));

    console.log('Scenario: user2@test.com / 67890 (New Secondary linking to user1 via 67890)');
    const res7 = await identifyContact("user2@test.com", "67890");
    console.log(JSON.stringify(res7, null, 2));

    console.log('Scenario: user1@test.com / 99999 (If 99999 belonged to another Primary)');
    // Setup another primary first
    const anotherPrimary = await prisma.contact.create({
        data: { email: "other@test.com", phoneNumber: "99999", linkPrecedence: "primary" }
    });
    console.log(`Created another primary with phone 99999 (ID: ${anotherPrimary.id})`);
    const res8 = await identifyContact("user1@test.com", "99999");
    console.log('Result for user1@test.com / 99999:');
    console.log(JSON.stringify(res8, null, 2));

    console.log('\n--- ALL TEST SCENARIOS COMPLETED ---');
    await prisma.$disconnect();
}

runScenarioTests();
