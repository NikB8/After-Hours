import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                clubMemberships: {
                    include: {
                        club: true
                    }
                },
                participations: {
                    where: {
                        status: 'Confirmed',
                        event: {
                            end_time: { lt: new Date() } // Past events
                        }
                    },
                    include: {
                        event: {
                            include: {
                                organizer: { select: { name: true, email: true } }
                            }
                        }
                    },
                    orderBy: {
                        event: { start_time: 'desc' }
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Transform for frontend
        const profileData = {
            ...user,
            clubs: user.clubMemberships.map(cm => ({
                id: cm.club.id,
                name: cm.club.name,
                role: cm.role,
                domain: cm.club.company_domain
            })),
            past_events: user.participations.map(p => ({
                id: p.event.id,
                sport: p.event.sport,
                venue_name: p.event.venue_name,
                start_time: p.event.start_time,
                organizer_email: p.event.organizer.email
            }))
        };

        return NextResponse.json(profileData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
