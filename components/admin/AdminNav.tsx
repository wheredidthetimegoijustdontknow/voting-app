'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    ChevronDown,
    LayoutDashboard,
    ShieldAlert,
    Bot,
    Users,
} from 'lucide-react';

const navItems = [
    { name: 'Admin Home', href: '/admin', icon: LayoutDashboard },
    { name: 'Moderation', href: '/admin/moderation', icon: ShieldAlert },
    { name: 'Bot Simulation', href: '/admin/botsim', icon: Bot },
    { name: 'User Management', href: '/admin/usermanagement', icon: Users },
];

export default function AdminNav() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Find active item, handles sub-paths if necessary but here simple match is best
    const activeItem = navItems.find(item => item.href === pathname) || navItems[0];

    return (
        <nav className="mb-8 relative z-50">
            <div className="flex items-center gap-4">
                {/* Dropdown Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl shadow-sm hover:border-indigo-300 transition-all duration-200 cursor-pointer"
                    >
                        <activeItem.icon size={18} className="text-indigo-600" />
                        <span className="font-medium text-zinc-900">{activeItem.name}</span>
                        <ChevronDown
                            size={16}
                            className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </button>

                    {isOpen && (
                        <>
                            {/* Overlay to close menu */}
                            <div
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={() => setIsOpen(false)}
                            />
                            <div className="absolute left-0 mt-2 w-56 bg-white border border-zinc-100 rounded-xl shadow-xl z-50 overflow-hidden py-1 transform transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${pathname === item.href
                                                ? 'bg-indigo-50 text-indigo-700 font-medium'
                                                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                                            }`}
                                    >
                                        <item.icon size={18} className={pathname === item.href ? 'text-indigo-600' : 'text-zinc-400'} />
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Small badge/label */}
                <div className="hidden sm:flex items-center gap-2">
                    <span className="h-4 w-[1px] bg-zinc-200 mx-2" />
                    <span className="font-medium text-zinc-400 uppercase tracking-widest text-[10px]">Admin Console</span>
                </div>
            </div>
        </nav>
    );
}
