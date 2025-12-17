'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-inverse)',
        border: '1px solid var(--color-primary)',
      };
    case 'secondary':
      return {
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        border: '1px solid var(--color-border-default)',
      };
    case 'ghost':
      return {
        backgroundColor: 'transparent',
        color: 'var(--color-text-secondary)',
        border: '1px solid transparent',
      };
    case 'danger':
      return {
        backgroundColor: 'var(--color-error)',
        color: 'var(--color-text-inverse)',
        border: '1px solid var(--color-error)',
      };
    default:
      return {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-text-inverse)',
        border: '1px solid var(--color-primary)',
      };
  }
};

const getSizeStyles = (size: ButtonSize) => {
  switch (size) {
    case 'sm':
      return {
        padding: '6px 12px',
        fontSize: 'var(--font-size-sm)',
        height: '32px',
      };
    case 'md':
      return {
        padding: '8px 16px',
        fontSize: 'var(--font-size-base)',
        height: '36px',
      };
    case 'lg':
      return {
        padding: '10px 20px',
        fontSize: 'var(--font-size-lg)',
        height: '40px',
      };
    default:
      return {
        padding: '8px 16px',
        fontSize: 'var(--font-size-base)',
        height: '36px',
      };
  }
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    fontWeight: '500',
    fontFamily: 'var(--font-family-sans)',
    lineHeight: 1,
    transition: 'all 0.15s ease',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    boxShadow: 'none',
    textDecoration: 'none',
    outline: 'none',
    whiteSpace: 'nowrap',
    userSelect: 'none' as const,
    WebkitTapHighlightColor: 'transparent',
    ...getVariantStyles(variant),
    ...getSizeStyles(size),
  };

  const hoverStyles: React.CSSProperties = !disabled ? {
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    filter: 'brightness(1.1)',
  } : {};

  const activeStyles: React.CSSProperties = !disabled ? {
    transform: 'translateY(1px)',
    filter: 'brightness(0.9)',
  } : {};

  const focusStyles: React.CSSProperties = !disabled ? {
    outline: 'none',
    boxShadow: '0 0 0 2px var(--color-background), 0 0 0 2px var(--color-primary)',
  } : {};

  return (
    <button
      className={className}
      disabled={disabled}
      style={{ ...baseStyles, ...hoverStyles }}
      onMouseEnter={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, baseStyles);
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, activeStyles);
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, hoverStyles);
        }
      }}
      onFocus={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, focusStyles);
        }
      }}
      onBlur={(e) => {
        if (!disabled) {
          Object.assign(e.currentTarget.style, baseStyles);
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}