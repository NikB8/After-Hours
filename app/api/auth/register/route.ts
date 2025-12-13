
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Extract Domain
        const domain = email.split('@')[1];

        // 2. Find Company
        let companyId: number | null = null;
        let isCorporateVerified = false;

        const company = await prisma.company.findUnique({
            where: { domain_name: domain }
        });

        if (company) {
            companyId = company.id;
            // Simplified: If company exists in our DB, we auto-verify for now? 
            // Or just mark them linked. Usually needs email verification link.
            // For this "Tooling" MVP, let's assume if it matches, we link but don't verify until they click link.
            // Prompt says: "Add Field: is_corporate_verified (FALSE default)". So we keep false.
        }

        // 3. Create User & Assign Role Transactionally
        const user = await prisma.$transaction(async (tx: any) => {
            const newUser = await tx.user.create({
                data: {
                    email,
                    name,
                    password: hashedPassword,
                    primary_company_id: companyId,
                    is_corporate_verified: false,
                    company_domain: domain
                },
            });

            // 4. Assign 'Player' Role
            const playerRole = await tx.role.findUnique({ where: { name: 'Player' } });
            if (playerRole) {
                await tx.userRole.create({
                    data: {
                        user_id: newUser.id,
                        role_id: playerRole.id,
                        company_id: companyId
                    }
                });
            }

            return newUser;
        });

        return NextResponse.json({
            message: "User created successfully",
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
