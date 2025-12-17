'use client';

import React from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  inputSize?: InputSize;
  helperText?: string;
}

const getSizeStyles = (size: InputSize) => {
  switch (size) {
    case 'sm':
      return {
        padding: '6px 10px',
        fontSize: 'var(--font-size-sm)',
        height: '32px',
      };
    case 'md':
      return {
        padding: '10px 12px',
        fontSize: 'var(--font-size-base)',
        height: '40px',
      };
    case 'lg':
      return {
        padding: '12px 16px',
        fontSize: 'var(--font-size-lg)',
        height: '48px',
      };
    default:
      return {
        padding: '10px 12px',
        fontSize: 'var(--font-size-base)',
        height: '40px',
      };
  }
};

export function Input({
  label,
  error,
  inputSize = 'md',
  helperText,
  className,
  style,
  disabled,
  ...props
}: InputProps) {
  const baseStyles = {
    width: '100%',
    border: '1px solid var(--color-border-default)',
    borderRadius: 'var(--radius-md)',
    backgroundColor: disabled ? 'var(--color-interactive-disabled)' : 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    lineHeight: 1.5,
    transition: 'all 0.2s ease',
    ...getSizeStyles(inputSize),
  };

  const focusStyles = {
    outline: 'none',
    borderColor: 'var(--color-primary)',
    boxShadow: '0 0 0 1px var(--color-primary)',
  };

  const errorStyles = error ? {
    borderColor: 'var(--color-error)',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
  } : {};

  return (
    <div className="space-y-1">
      {label && (
        <label
          className="text-body"
          style={{
            display: 'block',
            fontWeight: '500',
            marginBottom: 'var(--spacing-xs)',
            color: 'var(--color-text-primary)',
          }}
        >
          {label}
        </label>
      )}

      <input
        className={className}
        disabled={disabled}
        style={{ ...baseStyles, ...errorStyles, ...style }}
        {...props}
      />

      {error && (
        <p
          className="text-body-sm"
          style={{
            color: 'var(--color-error)',
            fontSize: 'var(--font-size-sm)',
            margin: 0,
          }}
        >
          {error}
        </p>
      )}

      {helperText && !error && (
        <p
          className="text-body-sm"
          style={{
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-sm)',
            margin: 0,
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}