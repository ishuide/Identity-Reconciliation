import { identifyContact } from './services/reconciliation';

async function runTests() {
    console.log('Starting Logic Verification Tests...');

    try {
        // 1. Rule A: New Identity
        console.log('\n--- Test 1: Rule A: New Identity ---');
        const res1 = await identifyContact("lorraine@msn.com", "123456");
        console.log(JSON.stringify(res1, null, 2));

        // 2. Rule B: Secondary Expansion
        console.log('\n--- Test 2: Rule B: Secondary Expansion (New Email) ---');
        const res2 = await identifyContact("mcfly@gmail.com", "123456");
        console.log(JSON.stringify(res2, null, 2));

        // 3. New Identity for George
        console.log('\n--- Test 3: New Primary for George ---');
        const res3 = await identifyContact("george@hillvalley.edu", "919191");
        console.log(JSON.stringify(res3, null, 2));

        // 4. Rule C: Primary to Secondary Conversion (Merge)
        // Link George (919191) to Lorraine (123456)
        console.log('\n--- Test 4: Rule C: Merging George into Lorraine cluster ---');
        const res4 = await identifyContact("george@hillvalley.edu", "123456");
        console.log(JSON.stringify(res4, null, 2));

        // 5. Final Check
        console.log('\n--- Test 5: Final Cluster Check ---');
        const res5 = await identifyContact("lorraine@msn.com", undefined);
        console.log(JSON.stringify(res5, null, 2));

        console.log('\nVerification complete!');
    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        process.exit(0);
    }
}

runTests();
