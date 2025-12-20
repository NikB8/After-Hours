
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env');

try {
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    lines.forEach(line => {
        if (line.trim().startsWith('DATABASE_URL')) {
            // Mask password but show structure
            // e.g. DATABASE_URL="postgres://..."
            console.log("Raw line found (sensitive info masked):");
            // Check for quotes
            const hasQuotes = line.includes('="') || line.includes("='");
            console.log(`Has Quotes? ${hasQuotes}`);

            // Print first few and last few chars to verify structure
            // Manual parse to find password
            const parts = line.split('://');
            if (parts.length > 1) {
                const afterProtocol = parts[1];
                const atIndex = afterProtocol.indexOf('@');
                if (atIndex !== -1) {
                    const credentials = afterProtocol.substring(0, atIndex);
                    const colonIndex = credentials.indexOf(':');
                    if (colonIndex !== -1) {
                        const password = credentials.substring(colonIndex + 1);
                        console.log(`Manual Parse Password Length: ${password.length}`);
                        if (password.length > 12) {
                            const charAt12 = password.charAt(12);
                            console.log(`Character at index 12 (cutoff point): '${charAt12}' (Code: ${charAt12.charCodeAt(0)})`);
                            console.log(`Is it a special char? ${/[^a-zA-Z0-9]/.test(charAt12)}`);
                        }
                    }
                }
            }
        }
    });
} catch (e) {
    console.error("Could not read .env:", e);
}
