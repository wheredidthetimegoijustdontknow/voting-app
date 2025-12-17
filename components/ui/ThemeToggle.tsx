'use client';

import { useTheme } from '@/lib/theme-provider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '8px 12px',
        backgroundColor: 'transparent',
        color: 'var(--color-text-secondary)',
        border: '1px solid transparent',
        borderRadius: '6px',
        fontSize: 'var(--font-size-sm)',
        fontWeight: '500',
        fontFamily: 'var(--font-family-sans)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: 'none',
        transform: 'translateY(0)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-interactive-hover)';
        e.currentTarget.style.color = 'var(--color-text-primary)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = 'var(--color-text-secondary)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = 'none';
        e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-background), 0 0 0 4px var(--color-primary)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {theme === 'light' ? (
        // Moon icon for dark mode
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      ) : (
        // Sun icon for light mode
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      )}
      <span className="text-sm">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}