import Link from 'next/link';

export default function Home() {
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

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/events"
            className="px-8 py-4 bg-green-600 text-white rounded-full font-semibold text-lg hover:bg-green-700 transition shadow-lg"
          >
            Browse Events
          </Link>
          <Link
            href="/clubs"
            className="px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-full font-semibold text-lg hover:bg-green-50 transition shadow-sm"
          >
            Explore Clubs
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Admin Access</p>
          <Link
            href="/admin"
            className="text-gray-400 hover:text-gray-600 text-sm underline"
          >
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
