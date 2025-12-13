'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, Settings, Shield, LogOut } from 'lucide-react';

const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Clubs', href: '/clubs', icon: Users },
    { name: 'Admin', href: '/admin', icon: Shield },
    { name: 'Profile', href: '/settings/profile', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-50 bg-card border-r border-border">
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4 mb-8">
                    <h1 className="text-2xl font-bold text-primary">After Hours</h1>
                </div>
                <div className="flex-grow flex flex-col">
                    <nav className="flex-1 px-2 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                        }`}
                                >
                                    <item.icon
                                        className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-accent-foreground'
                                            }`}
                                        aria-hidden="true"
                                    />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex-shrink-0 flex border-t border-border p-4">
                    <UserProfile />
                </div>
            </div>
        </div>
    );
}

import { useSession, signOut } from "next-auth/react";

function UserProfile() {
    const { data: session } = useSession();

    if (!session?.user) return null;

    return (
        <div className="flex items-center w-full gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {session.user.name?.[0] || session.user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                    {session.user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                </p>
            </div>
            <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                title="Sign Out"
            >
                <LogOut size={20} />
            </button>
        </div>
    );
}
