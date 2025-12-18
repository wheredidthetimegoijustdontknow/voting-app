'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListFilter, ShieldCheck, ChevronLeft, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import AuthButton from '../auth/AuthButton';

export function SidebarNav() {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Public Polls', href: '/', icon: ListFilter },
        { name: 'Admin', href: '/admin', icon: ShieldCheck },
    ];

    // Sidebar is expanded if: not collapsed, OR (collapsed but hovered and not locked to collapsed)
    const isExpanded = !isCollapsed || (isHovered && !isLocked);

    const handleToggleClick = () => {
        setIsCollapsed(!isCollapsed);
        setIsLocked(!isCollapsed); // Lock when collapsing, unlock when expanding
    };

    return (
        <aside
            className="hidden lg:flex flex-col h-screen sticky top-0 border-r transition-all duration-300"
            style={{
                width: isExpanded ? '256px' : '72px',
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border-default)'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between" style={{ minHeight: '72px' }}>
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity overflow-hidden">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20 shrink-0"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: '#FFFFFF'
                        }}
                    >
                        V
                    </div>
                    {isExpanded && (
                        <span
                            className="font-bold text-lg tracking-tight whitespace-nowrap"
                            style={{ color: 'var(--color-text-primary)' }}
                        >
                            Voting App
                        </span>
                    )}
                </Link>
            </div>

            {/* Theme Toggle - Just below logo */}
            <div className="px-4 pb-4">
                <button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ color: 'var(--color-text-secondary)' }}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? (
                        <Moon size={20} />
                    ) : (
                        <Sun size={20} />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${isActive ? 'shadow-sm' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                }`}
                            style={{
                                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                                color: isActive ? '#FFFFFF' : 'var(--color-text-secondary)',
                                justifyContent: isExpanded ? 'flex-start' : 'center'
                            } as React.CSSProperties}
                        >
                            <item.icon
                                size={20}
                                className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'group-hover:text-primary'
                                    }`}
                            />
                            {isExpanded && <span className="font-medium whitespace-nowrap">{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Toggle Button */}
            <div className="px-3 pb-3">
                <button
                    onClick={handleToggleClick}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {/* Auth Section */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
                <div className={isExpanded ? 'px-1' : 'flex justify-center'}>
                    <AuthButton collapsed={!isExpanded} />
                </div>
            </div>
        </aside>
    );
}
