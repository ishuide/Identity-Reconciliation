import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testIdentify(email: string | null, phoneNumber: string | null, description: string) {
    console.log(`\n--- Test: ${description} ---`);
    console.log(`Input: email=${email}, phoneNumber=${phoneNumber}`);
    try {
        const response = await axios.post(`${BASE_URL}/identify`, { email, phoneNumber });
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error: any) {
        console.error('Error:', error.response?.data || error.message);
    }
}

async function runTests() {
    console.log('Starting Identity Reconciliation Tests...');

    // 1. New Identity (Rule A)
    // Request: { "email": "lorraine@msn.com", "phoneNumber": "123456" }
    // Response: New primary contact
    await testIdentify("lorraine@msn.com", "123456", "Rule A: New Identity");

    // 2. Secondary Expansion (Rule B)
    // Request: { "email": "mcfly@gmail.com", "phoneNumber": "123456" }
    // Response: New secondary contact linked to lorraine@msn.com
    await testIdentify("mcfly@gmail.com", "123456", "Rule B: Secondary Expansion (New Email)");

    // 3. Another New Identity
    // Request: { "email": "george@hillvalley.edu", "phoneNumber": "919191" }
    await testIdentify("george@hillvalley.edu", "919191", "New Primary Contact for George");

    // 4. Primary to Secondary Conversion (Rule C)
    // Request: { "email": "george@hillvalley.edu", "phoneNumber": "123456" }
    // This links the George-cluster to the Lorraine-cluster. 
    // Since Lorraine came first, George becomes secondary.
    await testIdentify("george@hillvalley.edu", "123456", "Rule C: Primary to Secondary Conversion (Merging Clusters)");

    // 5. Final State Check
    // Request for one of the emails to see the full cluster
    await testIdentify("lorraine@msn.com", null, "Final State Check");
}

runTests();
