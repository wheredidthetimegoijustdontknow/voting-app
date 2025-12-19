import Link from 'next/link';
import { ThemeToggle } from './ui/ThemeToggle';
import AuthButton from './auth/AuthButton';
import { useAdminImpersonation } from '@/contexts/AdminImpersonationContext';
import { Shield, Eye, UserX } from 'lucide-react';

export function Header() {
    const { isImpersonating, impersonatedUser, originalUser } = useAdminImpersonation();

    return (
        <header
            className="sticky top-0 z-10 border-b backdrop-blur-md"
            style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fallback for no backdrop-blur
                borderColor: 'var(--color-border-default)'
            }}
        >
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img
                        src="/Polls_on_Parade_logo_transparent.PNG"
                        alt="Polls On Parade Logo"
                        className="w-8 h-8 rounded-lg"
                    />
                    <span
                        className="font-semibold text-lg tracking-tight"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Polls On Parade
                    </span>
                </Link>

                <nav className="flex items-center gap-6">
                    {/* Impersonation Status Indicator */}
                    {isImpersonating && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
                            <Eye size={12} />
                            <span>Viewing as @{impersonatedUser?.username}</span>
                            <span className="text-red-500">|</span>
                            <span className="text-red-600">Original: @{originalUser?.username}</span>
                        </div>
                    )}

                    <Link
                        href="/dashboard"
                        className="text-sm font-medium transition-colors hover:text-primary"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/"
                        className="text-sm font-medium transition-colors hover:text-primary"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        Public Polls
                    </Link>
                    <Link
                        href="/admin"
                        className="text-sm font-medium transition-colors hover:text-primary"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        Admin
                    </Link>

                    <div
                        className="h-4 w-px"
                        style={{ backgroundColor: 'var(--color-border-default)' }}
                    />

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <AuthButton />
                    </div>
                </nav>
            </div>
        </header>
    );
}
