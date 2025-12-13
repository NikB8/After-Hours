
const { PrismaClient } = require('@prisma/client');
console.log("Testing Admin Management APIs...");

const BASE_URL = 'http://localhost:3000/api/v1/admin';

async function testManagement() {
    // 1. List Orgs
    console.log("\n[1] Testing Org List...");
    const orgsRes = await fetch(`${BASE_URL}/organizations`);
    if (orgsRes.ok) {
        const orgs = await orgsRes.json();
        console.log(`PASS: Found ${orgs.length} orgs.`);
        if (orgs.length > 0) console.log(`   Sample: ${orgs[0].domain} (${orgs[0].user_count} users)`);
    } else {
        console.error(`FAIL: Org List failed ${orgsRes.status}`);
    }

    // 2. Search Users
    console.log("\n[2] Testing User Search...");
    const usersRes = await fetch(`${BASE_URL}/users?query=example`);
    if (usersRes.ok) {
        const data = await usersRes.json();
        console.log(`PASS: Found ${data.users.length} users with query 'example'.`);

        if (data.users.length > 0) {
            const userId = data.users[0].id;

            // 3. Get History
            console.log(`\n[3] Testing History for user ${userId}...`);
            const histRes = await fetch(`${BASE_URL}/users/${userId}/history`);
            if (histRes.ok) {
                const history = await histRes.json();
                console.log(`PASS: Retrieved history items: ${history.length}`);
            } else {
                console.error(`FAIL: History failed ${histRes.status}`);
            }
        }
    } else {
        console.error(`FAIL: User Search failed ${usersRes.status}`);
    }
}

testManagement();
