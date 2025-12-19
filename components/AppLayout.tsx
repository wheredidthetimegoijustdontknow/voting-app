'use client';

import { useState } from 'react';
import { SidebarNav } from './layout/SidebarNav';
import OnlineUsersBanner from './OnlineUsersBanner';
import ProfileChecker from './ProfileChecker';
import ActivityFeed from './ActivityFeed';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';
import { ChevronRight, ChevronLeft, Activity } from 'lucide-react';

interface AppLayoutProps {
    children: React.ReactNode;
    userId: string | null;
    initialUsername?: string;
    initialRole?: string;
}

export default function AppLayout({ children, userId, initialUsername, initialRole }: AppLayoutProps) {
    const { isImpersonating, impersonatedUser } = useAdminImpersonation();
    const [currentUsername, setCurrentUsername] = useState(initialUsername);
    const [isActivityOpen, setIsActivityOpen] = useState(true);

    // Use impersonated username if impersonation is active, otherwise use original username
    const displayUsername = isImpersonating ? impersonatedUser?.username : currentUsername;

    const handleUsernameUpdate = (username: string) => {
        if (!isImpersonating) {
            setCurrentUsername(username);
        }
    };

    const layoutContent = (
        <div className="min-h-screen flex transition-colors duration-300" style={{ backgroundColor: 'var(--color-background)' }}>
            {/* Left Sidebar Navigation */}
            <SidebarNav userRole={initialRole} currentUsername={displayUsername} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 overflow-y-auto relative pb-20">
                    <div className="max-w-6xl mx-auto p-6">
                        {children}
                    </div>
                </main>

                <OnlineUsersBanner
                    userId={userId}
                    currentUsername={displayUsername}
                />
            </div>

            {/* Right Sidebar - Activity Feed (Collapsible) - Only for authenticated users */}
            {userId && (
                <aside
                    className={`hidden lg:flex flex-col border-l transition-all duration-300 ease-in-out relative ${isActivityOpen ? 'w-80' : 'w-12'}`}
                    style={{
                        backgroundColor: 'var(--color-surface)',
                        borderColor: 'var(--color-border-default)'
                    }}
                >
                    <button
                        onClick={() => setIsActivityOpen(!isActivityOpen)}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white flex items-center justify-center shadow-md hover:scale-110 transition-transform z-20"
                    >
                        {isActivityOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>

                    {isActivityOpen ? (
                        <div className="flex-1 overflow-hidden animate-in fade-in duration-500">
                            <ActivityFeed />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-6 gap-6">
                            <Activity className="text-zinc-400" size={20} />
                            <div className="h-px w-6 bg-zinc-200 dark:bg-zinc-800" />
                        </div>
                    )}
                </aside>
            )}
        </div>
    );

    if (userId) {
        return (
            <ProfileChecker
                userId={userId}
                currentUsername={displayUsername}
                onUsernameUpdate={handleUsernameUpdate}
            >
                {layoutContent}
            </ProfileChecker>
        );
    }

    return layoutContent;
}
