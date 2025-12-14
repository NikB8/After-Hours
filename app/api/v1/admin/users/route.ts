
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(request: Request) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';
    const page = Number(searchParams.get('page')) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    try {
        const whereClause: any = {};

        if (query) {
            whereClause.OR = [
                { email: { contains: query, mode: 'insensitive' as const } },
                { name: { contains: query, mode: 'insensitive' as const } }
            ];
        }

        const companyDomain = searchParams.get('company_domain');
        if (companyDomain) {
            whereClause.company_domain = companyDomain;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    is_super_admin: true,
                    createdAt: true,
                    company_domain: true,
                    emailVerified: true,
                    image: true,
                    roles: {
                        include: {
                            role: true,
                            company: true
                        }
                    }
                }
            }),
            prisma.user.count({ where: whereClause })
        ]);

        return NextResponse.json({
            users,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page
            }
        });

    } catch (error) {
        console.error("Admin Users Error:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}


import { hash } from 'bcryptjs';

export async function POST(request: Request) {
    const session = await auth();
    const isSuperAdmin = (session?.user as any)?.is_super_admin;
    if (!isSuperAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const body = await request.json();
        const { email, name, password, company_domain } = body;

        if (!email || !password) return NextResponse.json({ error: 'Email and Password required' }, { status: 400 });

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return NextResponse.json({ error: 'User already exists' }, { status: 409 });

        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                company_domain,
                // defaults
                // defaults
            }
        });

        // Hide password in response
        const { password: _, ...result } = user;
        return NextResponse.json(result);

    } catch (error) {
        console.error("Create User Error:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
