
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nexus AM Automation</h1>
        <p className="text-gray-500 mb-8">Internal Client Success Module</p>

        <div className="space-y-4">
          <Link
            href="/dashboard/am"
            className="block w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            👨‍💼 Account Manager Dashboard
          </Link>

          <Link
            href="/dashboard/cluster"
            className="block w-full py-3 px-4 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-medium transition-colors"
          >
            🏢 Cluster Lead Dashboard
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            <span className="font-bold text-xl text-gray-900">Nexus</span>
            System Status: <span className="text-green-500">Online</span> • Port: 3001
          </p>
        </div>
      </div>
    </div>
  );
}
