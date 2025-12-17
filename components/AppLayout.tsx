'use client';

import { useState } from 'react';
import { Header } from './Header';
import OnlineUsersBanner from './OnlineUsersBanner';
import ProfileChecker from './ProfileChecker';
import ActivityFeed from './ActivityFeed';

interface AppLayoutProps {
    children: React.ReactNode;
    userId: string | null;
    initialUsername?: string;
}

export default function AppLayout({ children, userId, initialUsername }: AppLayoutProps) {
    const [currentUsername, setCurrentUsername] = useState(initialUsername);

    const handleUsernameUpdate = (username: string) => {
        setCurrentUsername(username);
    };

    const layoutContent = (
        <div className="min-h-screen flex flex-col transition-colors duration-300" style={{ backgroundColor: 'var(--color-background)' }}>
            <Header />

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Activity Feed */}
                <aside className="hidden lg:block w-80 flex-shrink-0 animate-in slide-in-from-left duration-500">
                    <ActivityFeed />
                </aside>

                <main className="flex-1 w-full overflow-y-auto">
                    {children}
                </main>
            </div>

            <OnlineUsersBanner
                userId={userId}
                currentUsername={currentUsername}
            />
        </div>
    );

    if (userId) {
        return (
            <ProfileChecker
                userId={userId}
                currentUsername={currentUsername}
                onUsernameUpdate={handleUsernameUpdate}
            >
                {layoutContent}
            </ProfileChecker>
        );
    }

    return layoutContent;
}
