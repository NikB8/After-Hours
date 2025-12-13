const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("\n--- Supabase Connection String Generator ---");
console.log("This script will help you look for special characters that break URLs.\n");

rl.question('1. Paste your DB Password (raw): ', (password) => {
    rl.question('2. Paste your Supabase Host (e.g., db.xyz.supabase.co): ', (host) => {

        // Encode the password properly
        const encodedPassword = encodeURIComponent(password);

        console.log("\n---------------------------------------------------");
        console.log("✅ YOUR SAFE CONNECTION STRINGS (Copy these to Vercel)");
        console.log("---------------------------------------------------\n");

        console.log("DATABASE_URL (Transaction / Port 6543):");
        console.log(`postgres://postgres:${encodedPassword}@${host}:6543/postgres?pgbouncer=true`);

        console.log("\nDIRECT_URL (Session / Port 5432):");
        console.log(`postgres://postgres:${encodedPassword}@${host}:5432/postgres`);

        console.log("\n---------------------------------------------------");

        if (password !== encodedPassword) {
            console.log("⚠️  NOTICE: Your password contained special characters!");
            console.log(`   Original: ${password}`);
            console.log(`   Encoded:  ${encodedPassword}`);
            console.log("   This was likely why Vercel could not connect.");
        } else {
            console.log("ℹ️  Your password was safe (no encoding needed).");
            console.log("   If this still fails, double check 'Network Restrictions' in Supabase.");
        }

        rl.close();
    });
});
