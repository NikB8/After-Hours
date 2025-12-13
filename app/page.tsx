import Link from 'next/link';
import { CredentialsLogin } from '@/components/SignIn';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { DashboardEventList, DashboardClubList } from '@/components/DashboardLists';
import HomeActionButtons from '@/components/HomeActionButtons';

export default async function Home() {
  const session = await auth();

  let hostedEvents: any[] = [];
  let participatingEvents: any[] = [];
  let myClubs: any[] = [];

  if (session?.user?.email) {
    const userId = (session.user as any).id; // Make sure ID is available in session
    // If user ID not in session, fetch it via email
    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });

    if (user) {
      [hostedEvents, participatingEvents, myClubs] = await Promise.all([
        prisma.event.findMany({
          where: { organizer_id: user.id },
          take: 5,
          orderBy: { start_time: 'asc' }
        }),
        prisma.participant.findMany({
          where: { user_id: user.id },
          include: { event: true },
          take: 5,
          orderBy: { event: { start_time: 'asc' } }
        }),
        prisma.clubMember.findMany({
          where: { user_id: user.id },
          include: { club: true },
          take: 5
        })
      ]);

      // Serialize data to Plain Objects to valid "Decimal object" errors in Client Components
      hostedEvents = JSON.parse(JSON.stringify(hostedEvents));
      participatingEvents = JSON.parse(JSON.stringify(participatingEvents));
      myClubs = JSON.parse(JSON.stringify(myClubs));
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6">
          After <span className="text-green-600">Hours</span>
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          The ultimate platform for corporate sports, social clubs, and team building.
          Organize events, manage RSVPs, and split costs effortlessly.
        </p>

        <HomeActionButtons isLoggedIn={!!session} />

        {session ? (
          <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end mb-8">
              <div className="text-left">
                <h2 className="text-3xl font-bold text-gray-900">Welcome back, {session.user?.name?.split(' ')[0]}! 👋</h2>
                <p className="text-gray-500 mt-1">Here's what's happening with your activities.</p>
              </div>
              <div className="flex gap-3">
                {((session?.user as any)?.roles?.some((r: any) => r.name === 'System_Admin')) && (
                  <Link href="/admin" className="hidden sm:inline-flex px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm">
                    Go to Admin Panel
                  </Link>
                )}
                <Link href="/events/new" className="hidden sm:inline-flex px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition shadow-sm">
                  + Quick Create
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Column 1: My Hosted Events */}
              <div className="md:col-span-1">
                <DashboardEventList
                  title="Hosted by You"
                  events={hostedEvents}
                  emptyMessage="You haven't hosted any upcoming events."
                  type="hosted"
                />
              </div>

              {/* Column 2: Participating */}
              <div className="md:col-span-1">
                <DashboardEventList
                  title="Your RSVPs"
                  events={participatingEvents}
                  emptyMessage="No upcoming events joined."
                  type="participating"
                />
              </div>

              {/* Column 3: Clubs */}
              <div className="md:col-span-1">
                <DashboardClubList clubs={myClubs} />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-sm mx-auto">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Login / Sign Up</h3>
            <div className="flex flex-col gap-3">
              <CredentialsLogin />
              <div className="text-center text-sm pt-2">
                <Link href="/register" className="text-blue-600 hover:text-blue-500">
                  Create an Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
