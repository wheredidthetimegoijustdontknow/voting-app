'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListFilter, ShieldCheck, ChevronLeft, ChevronRight, Sun, Moon, Bot, ShieldAlert, Users, ChevronDown } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import AuthButton from '../auth/AuthButton';

interface SidebarNavProps {
    userRole?: string;
}

export function SidebarNav({ userRole }: SidebarNavProps) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(pathname.startsWith('/admin'));

    const isAdmin = userRole === 'admin';

    const navItems = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Public Polls', href: '/', icon: ListFilter },
    ];

    const adminSubItems = [
        { name: 'Admin Home', href: '/admin', icon: ShieldCheck },
        { name: 'Moderation', href: '/admin/moderation', icon: ShieldAlert },
        { name: 'Bot Simulation', href: '/admin/botsim', icon: Bot },
        { name: 'User Management', href: '/admin/usermanagement', icon: Users },
    ];

    // Sidebar is expanded if: not collapsed, OR (collapsed but hovered and not locked to collapsed)
    const isExpanded = !isCollapsed || (isHovered && !isLocked);

    const handleToggleClick = () => {
        setIsCollapsed(!isCollapsed);
        setIsLocked(!isCollapsed); // Lock when collapsing, unlock when expanding
    };

    return (
        <aside
            className="hidden lg:flex flex-col h-screen sticky top-0 border-r transition-all duration-300 relative"
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
                    className="w-full flex items-center justify-center p-2 rounded-lg border-2 border-zinc-200 dark:border-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
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

                {/* Admin Menu Section */}
                {isAdmin && (
                    <div className="pt-2">
                        {isExpanded ? (
                            <>
                                <button
                                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                                    className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 group hover:bg-zinc-100 dark:hover:bg-zinc-800 ${isAdminMenuOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck size={20} className={isAdminMenuOpen ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-indigo-500'} />
                                        <span className="font-medium whitespace-nowrap">Admin</span>
                                    </div>
                                    <ChevronDown size={16} className={`transition-transform duration-200 ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isAdminMenuOpen && (
                                    <div className="mt-1 ml-4 border-l-2 border-zinc-100 dark:border-zinc-800 space-y-1 animate-in slide-in-from-top-1 duration-200">
                                        {adminSubItems.map((subItem) => {
                                            const isSubActive = pathname === subItem.href;
                                            return (
                                                <Link
                                                    key={subItem.href}
                                                    href={subItem.href}
                                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${isSubActive
                                                            ? 'text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/50 dark:bg-indigo-900/20'
                                                            : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                                        }`}
                                                >
                                                    <subItem.icon size={16} />
                                                    <span className="text-sm whitespace-nowrap">{subItem.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        ) : (
                            <Link
                                href="/admin"
                                className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${pathname.startsWith('/admin') ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'text-zinc-400'}`}
                                title="Admin Panel"
                            >
                                <ShieldCheck size={20} />
                            </Link>
                        )}
                    </div>
                )}
            </nav>



            {/* Auth Section */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--color-border-default)' }}>
                <div className={isExpanded ? 'px-1' : 'flex justify-center'}>
                    <AuthButton collapsed={!isExpanded} />
                </div>
            </div>

            <button
                onClick={handleToggleClick}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-black border-3 border-black dark:border-white text-black dark:text-white flex items-center justify-center shadow-md hover:scale-110 transition-all z-50"
            >
                {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
        </aside>
    );
}
