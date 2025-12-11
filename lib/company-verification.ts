import { prisma } from '@/lib/prisma';

/**
 * Assigns a user to a company group based on their email domain.
 * This is intended to be called after email verification or profile update.
 */
export async function assignCompanyGroup(userId: string, email: string) {
    const domain = email.split('@')[1];

    // List of known corporate domains (mock)
    const CORPORATE_DOMAINS = ['google.com', 'microsoft.com', 'amazon.com', 'meta.com'];

    if (!domain) return;

    // Check if domain is corporate
    // In a real app, this might check against a database of companies
    const isCorporate = CORPORATE_DOMAINS.includes(domain) || domain.endsWith('.corp');

    if (isCorporate) {
        console.log(`Assigning user ${userId} to company group for ${domain}`);

        // Logic to assign group would go here
        // For now, we just update the company_domain field if not set
        await prisma.user.update({
            where: { id: userId },
            data: { company_domain: domain },
        });
    }
}
