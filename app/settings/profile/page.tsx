import ProfileSkillForm from '@/components/ProfileSkillForm';

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Profile Settings</h1>
                <ProfileSkillForm />
            </div>
        </div>
    );
}
