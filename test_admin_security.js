
const { PrismaClient } = require('@prisma/client');

async function testAdminSecurity() {
    console.log("Testing Admin Security Access...");

    const endpoints = [
        'http://localhost:3000/api/v1/admin/kpis',
        'http://localhost:3000/api/v1/admin/financial_summary',
        'http://localhost:3000/api/v1/admin/growth',
    ];

    for (const url of endpoints) {
        try {
            // Request WITHOUT any auth cookies
            const res = await fetch(url);

            if (res.status === 403 || res.status === 401) {
                console.log(`PASS: Access to ${url.split('/v1/')[1]} denied with ${res.status}`);
            } else if (res.status === 200) {
                const data = await res.json();
                if (data.error) {
                    console.log(`PASS: Access to ${url.split('/v1/')[1]} denied with JSON error`);
                } else {
                    console.error(`FAIL: Access to ${url} ALLOWED (Status 200)`);
                }
            } else {
                console.log(`WARN: Accessed ${url} returned ${res.status}`);
            }

        } catch (e) {
            console.error(`Error accessing ${url}:`, e.message);
        }
    }
}

testAdminSecurity();
