import Link from 'next/link';
import { CredentialsLogin } from '@/components/SignIn';
import { auth } from '@/auth';
import HomeActionButtons from '@/components/HomeActionButtons';
import HomeDashboardUI from '@/components/HomeDashboardUI';

export default async function Home() {
  const session = await auth();
  console.log("DEBUG: Home session:", JSON.stringify(session, null, 2));



  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-extrabold text-foreground mb-6">
          After <span className="text-primary">Hours</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10">
          The ultimate platform for corporate sports, social clubs, and team building.
          Organize events, manage RSVPs, and split costs effortlessly.
        </p>

        <HomeActionButtons isLoggedIn={!!session} />

        {session ? (
          <HomeDashboardUI userName={session.user?.name?.split(' ')[0] || 'User'} />
        ) : (
          <div className="bg-card p-6 rounded-xl shadow-sm border border-border max-w-sm mx-auto">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Login / Sign Up</h3>
            <div className="flex flex-col gap-3">
              <CredentialsLogin />
              <div className="text-center text-sm pt-2">
                <Link href="/register" className="text-primary hover:text-primary/80">
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
