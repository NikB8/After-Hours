
import { PrismaClient } from '@prisma/client';
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testRegistration() {
    const email = `test_${Date.now()}@example.com`;
    const password = "password123";
    const name = "Test User";

    console.log(`Testing registration for ${email}...`);

    let endpoint = 'http://localhost:3000/api/auth/register';

    // Quick fetch polyfill or use native if Node 18+
    // Assuming Node 18+ which has fetch
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });

        let data;
        try { data = await response.json(); } catch (e) { data = await response.text(); }

        if (!response.ok) {
            console.log("Port 3000 failed/returned error:", response.status, data);
            // Try 3001 if connection refused or 404
        } else {
            console.log("Registration API Success:", data);
        }

        // Verify in DB
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.error("User NOT found in DB!");
        } else {
            console.log("User found in DB:", user.email);
            const isMatch = await bcrypt.compare(password, user.password);
            console.log("Password Hash Match:", isMatch);
        }

    } catch (e) {
        console.error("Fetch failed:", e);
    }
}

testRegistration()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
