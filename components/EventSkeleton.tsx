import { Calendar, MapPin, Users } from 'lucide-react';

export default function EventSkeleton() {
    return (
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden h-full flex flex-col">
            {/* Image Skeleton */}
            <div className="h-48 bg-muted animate-pulse relative"></div>

            {/* Content Skeleton */}
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-6 bg-muted rounded w-3/4 animate-pulse"></div>
                    <div className="h-6 w-16 bg-muted rounded animate-pulse"></div>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-muted animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-1/2 animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-muted animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full bg-muted animate-pulse"></div>
                        <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
                    </div>
                </div>

                <div className="h-10 bg-muted rounded-xl w-full mt-auto animate-pulse"></div>
            </div>
        </div>
    );
}
