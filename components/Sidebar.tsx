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
                    <button className="flex-shrink-0 w-full group block">
                        <div className="flex items-center">
                            <div className="ml-3">
                                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                    Sign Out
                                </p>
                            </div>
                            <LogOut className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
