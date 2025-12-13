'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EventForm({ userEmail }: { userEmail: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showCustomSport, setShowCustomSport] = useState(false);

    const [formData, setFormData] = useState({
        sport: 'Badminton',
        start_time: '',
        end_time: '',
        venue_name: '',
        map_link: '',
        max_players: 4,
        estimated_cost: 0,
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
                // Format to datetime-local string: YYYY-MM-DDTHH:mm
                const endString = end.toISOString().slice(0, 16);
                newState.end_time = endString;
            }
            return newState;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/v1/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, organizer_email: userEmail }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create event');
            }

            const event = await res.json();
            router.push(`/events/${event.id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 flex items-center gap-2">
                    ⚠️ {error}
                </div>
            )}

            <div>
                <label className="form-label">Sport / Activity <span className="text-red-500">*</span></label>
                {showCustomSport ? (
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
                            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
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
                            <span className="text-gray-500 sm:text-sm">₹</span>
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

            <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
            >
                {loading ? 'Creating Event...' : 'Create Event'}
            </button>
        </form>
    );
}
