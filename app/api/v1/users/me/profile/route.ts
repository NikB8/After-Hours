import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const userProfile = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                company_name: true,
                is_super_admin: true,
                primary_company: {
                    select: {
                        domain_name: true,
                        id: true
                    }
                },
                clubMemberships: {
                    include: {
                        club: true
                    }
                },
                participations: {
                    include: {
                        event: {
                            include: {
                                club: true,
                                company: true
                            }
                        }
                    },
                    orderBy: {
                        event: {
                            start_time: 'desc'
                        }
                    }
                },
                managedEvents: {
                    include: {
                        club: true,
                        company: true,
                        participants: {
                            where: { user_id: userId }
                        }
                    },
                    orderBy: {
                        start_time: 'desc'
                    }
                }
            }
        });

        if (!userProfile) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Process Events to create a unified history
        // We want to merge participations and managed events (if not already in participations)
        // However, usually organizers are not automatically participants in simple schemas unless explicitly added. 
        // We'll trust the 'participations' list for mainly 'Participant' roles, and add 'managedEvents' if they aren't there.
        // Actually, for a history view, seeing events you organized is important.

        // Let's format the response
        return NextResponse.json(userProfile);

    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { name },
            select: { id: true, name: true }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
