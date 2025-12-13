'use client';

import Link from 'next/link';
import { Calendar, Users, MapPin, ArrowRight } from 'lucide-react';

export function DashboardEventList({ title, events, emptyMessage, type = 'hosted' }: { title: string, events: any[], emptyMessage: string, type?: 'hosted' | 'participating' }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 min-h-[60px]">
                <h3 className="font-semibold text-gray-900 line-clamp-1">{title}</h3>
                <Link href="/events" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 whitespace-nowrap ml-4">
                    View All <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="divide-y divide-gray-50 flex-1 flex flex-col">
                {events.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm flex-1 flex items-center justify-center">
                        {emptyMessage}
                    </div>
                ) : (
                    events.map((item: any) => {
                        const event = type === 'hosted' ? item : item.event;
                        return (
                            <Link key={event.id} href={`/events/${event.id}`} className="block hover:bg-gray-50 transition-colors">
                                <div className="p-4 flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex flex-col items-center justify-center text-xs font-bold border border-blue-100">
                                        <span>{new Date(event.start_time || event.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-lg leading-none">{new Date(event.start_time || event.date).getDate()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 truncate">{event.title || event.sport + ' Match'}</h4>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.venue_name || event.location}</span>
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.max_players ? `${event.max_players} slots` : 'Open'}</span>
                                        </div>
                                    </div>
                                    {type === 'participating' && (
                                        <span className={`text-xs px-2 py-1 rounded-full border ${item.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                                            item.status === 'Waitlist' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                'bg-gray-50 text-gray-600 border-gray-100'
                                            }`}>
                                            {item.status}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export function DashboardClubList({ clubs }: { clubs: any[] }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 min-h-[60px]">
                <h3 className="font-semibold text-gray-900">My Clubs</h3>
                <Link href="/clubs" className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1 whitespace-nowrap ml-4">
                    Find Clubs <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
            <div className="divide-y divide-gray-50 flex-1 flex flex-col">
                {clubs.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm flex-1 flex items-center justify-center">
                        You haven't joined any clubs yet.
                    </div>
                ) : (
                    clubs.map((membership: any) => (
                        <div key={membership.club.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center text-green-700 font-bold text-sm border border-green-200">
                                    {membership.club.name[0]}
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900">{membership.club.name}</h4>
                                    <p className="text-xs text-gray-500">{membership.role}</p>
                                </div>
                            </div>
                            <Link href={`/clubs/${membership.club.id}`} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                                View
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
