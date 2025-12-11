'use client';

import { useState } from 'react';

const SKILL_LEVELS = [
    { value: 'Beginner', label: 'Beginner', description: 'Just starting out or play casually.' },
    { value: 'Intermediate', label: 'Intermediate', description: 'Play regularly and know the rules well.' },
    { value: 'Advanced', label: 'Advanced', description: 'Competitive player with strong skills.' },
    { value: 'Pro', label: 'Pro', description: 'Professional or highly competitive level.' },
];

export default function ProfileSkillForm() {
    const [skillLevel, setSkillLevel] = useState('Beginner');
    const [bio, setBio] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/v1/users/profile/skill', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ skill_level: skillLevel, bio }),
            });

            if (!res.ok) throw new Error('Failed to update profile');

            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Error updating profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Your Profile</h2>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio / About You</label>
                <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Tell us about your sports interests..."
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Skill Level</h3>
                {SKILL_LEVELS.map((level) => (
                    <label
                        key={level.value}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${skillLevel === level.value
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <input
                            type="radio"
                            name="skill_level"
                            value={level.value}
                            checked={skillLevel === level.value}
                            onChange={(e) => setSkillLevel(e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">{level.label}</span>
                            <span className="block text-sm text-gray-500">{level.description}</span>
                        </div>
                    </label>
                ))}
            </div>

            {message && (
                <div className={`p-3 rounded-md text-sm ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {loading ? 'Saving...' : 'Save Skill Level'}
            </button>
        </form>
    );
}
