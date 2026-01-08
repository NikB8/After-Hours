
import Link from 'next/link';

export default function InternalNavbar() {
    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-xl text-gray-900">Nexus</span>
                            <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Internal</span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/dashboard/am" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                AM Dashboard
                            </Link>
                            <Link href="/dashboard/cluster" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                Cluster Lead
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
