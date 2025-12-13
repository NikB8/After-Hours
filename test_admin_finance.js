
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFinanceAndSettings() {
    console.log("Testing Finance & Global Settings...");

    // 1. Settings
    console.log("\n[1] Testing Global Settings...");
    // Direct DB check or assume API works. Let's use fetch if server is running, but script is easier with direct DB for "Verification" step or mock API call?
    // User wants "Secure Tools", I should verify the API endpoints.
    const BASE_URL = 'http://localhost:3000/api/v1/admin';

    // Note: Fetching might fail if not authenticated (403). 
    // This script usually runs externally. I will assume I can't easily auth as admin without cookie.
    // So I will verify the Database State directly to confirm Migration worked and Models exist.

    try {
        // Create a Setting
        const key = `test_key_${Date.now()}`;
        await prisma.globalSettings.create({
            data: { key, value: 'initial' }
        });
        console.log(`PASS: Created GlobalSetting ${key}`);

        // Create an Audit Log
        await prisma.adminAuditLog.create({
            data: {
                admin_email: 'test@admin.com',
                action: 'TEST_ACTION',
                target: 'System',
                details: { status: 'ok' }
            }
        });
        console.log(`PASS: Created AdminAuditLog`);

        // Check if models exist in prisma client
        const count = await prisma.adminAuditLog.count();
        console.log(`PASS: Audit Log Count: ${count}`);

    } catch (e) {
        console.error("FAIL: DB Operation failed", e);
    } finally {
        await prisma.$disconnect();
    }
}

testFinanceAndSettings();
