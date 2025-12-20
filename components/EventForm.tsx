'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserMultiSelect from '@/components/UserMultiSelect';
import { triggerHaptic } from '@/lib/haptics';

export interface EventFormData {
    sport: string;
    start_time: string;
    end_time: string;
    venue_name: string;
    map_link: string;
    max_players: number;
    estimated_cost: number;
    transport_mode?: string;
    car_seats?: number;
}

interface EventFormProps {
    userEmail: string;
    initialData?: EventFormData;
    eventId?: string;
    isEditMode?: boolean;
}

export default function EventForm({ userEmail, initialData, eventId, isEditMode = false }: EventFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCustomSport, setShowCustomSport] = useState(false);
    const [invitedUserIds, setInvitedUserIds] = useState<string[]>([]);

    const [formData, setFormData] = useState<EventFormData>(initialData || {
        sport: '',
        start_time: '',
        end_time: '',
        venue_name: '',
        map_link: '',
        max_players: 4,
        estimated_cost: 0,
        transport_mode: 'Independent',
        car_seats: 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Auto-set end time to 1 hour after start time if not set
    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const startTime = e.target.value;
        setFormData((prev) => {
            const newState = { ...prev, start_time: startTime };
            if (startTime && !prev.end_time) {
                const start = new Date(startTime);
                const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

                // Format to datetime-local string manually to preserve local time: YYYY-MM-DDTHH:mm
                const pad = (num: number) => num.toString().padStart(2, '0');
                const endString = `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}T${pad(end.getHours())}:${pad(end.getMinutes())}`;

                newState.end_time = endString;
            }
            return newState;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate dates
        if (new Date(formData.end_time) <= new Date(formData.start_time)) {
            setError('End time must be after start time');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const url = isEditMode && eventId ? `/api/v1/events/${eventId}` : '/api/v1/events';
            const method = isEditMode ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, organizer_email: userEmail, invitedUserIds }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to save event');
            }

            const event = await res.json();

            // Redirect to event page
            router.push(`/events/${event.id}`);
            router.refresh();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-8 rounded-2xl shadow-lg border border-border">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/30 flex items-center gap-2">
                    ⚠️ {error}
                </div>
            )}

            <div>
                <label className="form-label">Sport / Activity <span className="text-red-500">*</span></label>
                {showCustomSport || (isEditMode && !['Badminton', 'Football', 'Basketball', 'Tennis', 'Cricket', 'Pickleball'].includes(formData.sport) && formData.sport !== '') ? (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            name="sport"
                            autoFocus
                            placeholder="Enter activity name (e.g. Hiking, Board Games)"
                            value={formData.sport}
                            onChange={handleChange}
                            className="form-input flex-1"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setShowCustomSport(false);
                                setFormData(prev => ({ ...prev, sport: 'Badminton' }));
                            }}
                            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground font-medium"
                        >
                            Select from list
                        </button>
                    </div>
                ) : (
                    <select
                        name="sport"
                        value={formData.sport}
                        onChange={(e) => {
                            if (e.target.value === 'Other') {
                                setShowCustomSport(true);
                                setFormData(prev => ({ ...prev, sport: '' }));
                            } else {
                                handleChange(e);
                            }
                        }}
                        className="form-select"
                    >
                        <option value="" disabled>Select a sport</option>
                        <option value="Badminton">Badminton</option>
                        <option value="Football">Football</option>
                        <option value="Basketball">Basketball</option>
                        <option value="Tennis">Tennis</option>
                        <option value="Cricket">Cricket</option>
                        <option value="Pickleball">Pickleball</option>
                        <option value="Other">Other</option>
                    </select>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label className="form-label">Start Time <span className="text-red-500">*</span></label>
                    <input
                        type="datetime-local"
                        name="start_time"
                        required
                        value={formData.start_time}
                        onChange={handleStartTimeChange}
                        className="form-input"
                    />
                </div>

                <div>
                    <label className="form-label">End Time <span className="text-red-500">*</span></label>
                    <input
                        type="datetime-local"
                        name="end_time"
                        required
                        value={formData.end_time}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
            </div>

            <div>
                <label className="form-label">Venue Name <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    name="venue_name"
                    required
                    placeholder="e.g. Downtown Sports Complex"
                    value={formData.venue_name}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>

            <div>
                <label className="form-label">Google Maps Link <span className="text-red-500">*</span></label>
                <input
                    type="url"
                    name="map_link"
                    required
                    placeholder="https://maps.google.com/..."
                    value={formData.map_link}
                    onChange={handleChange}
                    className="form-input"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label className="form-label">Max Players <span className="text-red-500">*</span></label>
                    <input
                        type="number"
                        name="max_players"
                        min="2"
                        required
                        value={formData.max_players}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>

                <div>
                    <label className="form-label">Estimated Cost (Total) <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-muted-foreground sm:text-sm">₹</span>
                        </div>
                        <input
                            type="number"
                            name="estimated_cost"
                            min="0"
                            step="0.01"
                            required
                            value={formData.estimated_cost}
                            onChange={handleChange}
                            className="form-input pl-7"
                        />
                    </div>
                </div>
            </div>

            {!isEditMode && (
                <div className="pt-4 border-t border-border">
                    <h3 className="text-lg font-medium text-foreground mb-4">Invite Others</h3>
                    <UserMultiSelect onSelectionChange={(ids) => setInvitedUserIds(ids)} />
                </div>
            )}

            {!isEditMode && (
                <div className="pt-4 border-t border-border">
                    <h3 className="text-lg font-medium text-foreground mb-4">Your Transport</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">How are you getting there? <span className="text-red-500">*</span></label>
                            <select
                                name="transport_mode"
                                value={formData.transport_mode || 'Independent'}
                                onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Independent">Reaching Myself</option>
                                <option value="Rider">Need a Ride</option>
                                <option value="Driver">I have a car</option>
                            </select>
                        </div>

                        {formData.transport_mode === 'Driver' && (
                            <div>
                                <label className="form-label">Seats Available <span className="text-red-500">*</span></label>
                                <input
                                    type="number"
                                    name="car_seats"
                                    min="1"
                                    required
                                    value={formData.car_seats || ''}
                                    onChange={handleChange}
                                    placeholder="Number of passengers you can take"
                                    className="form-input"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                onClick={() => triggerHaptic()}
                className="btn-primary w-full"
            >
                {loading ? 'Saving...' : (isEditMode ? 'Update Event' : 'Create Event')}
            </button>
        </form>
    );
}
