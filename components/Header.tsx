import Link from 'next/link';
import { ThemeToggle } from './ui/ThemeToggle';
import AuthButton from './auth/AuthButton';

export function Header() {
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
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-lg"
                        style={{
                            backgroundColor: 'var(--color-primary)',
                            color: '#FFFFFF'
                        }}
                    >
                        V
                    </div>
                    <span
                        className="font-semibold text-lg tracking-tight"
                        style={{ color: 'var(--color-text-primary)' }}
                    >
                        Voting App
                    </span>
                </Link>

                <nav className="flex items-center gap-6">
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
