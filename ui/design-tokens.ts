/**
 * Design Tokens for Voting App
 * Based on the Hive Admin Dashboard UI Style Guide
 */

export const designTokens = {
  // Spacing System (8px base unit)
  spacing: {
    xs: '4px',    // 0.5 * base
    sm: '8px',    // 1 * base
    md: '16px',   // 2 * base
    lg: '24px',   // 3 * base
    xl: '32px',   // 4 * base
    xxl: '48px',  // 6 * base
  },

  // Typography Scale
  typography: {
    fontFamily: {
      sans: 'Inter, SF Pro, system-ui, -apple-system, sans-serif',
      mono: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '13px',
      base: '14px',
      lg: '15px',
      xl: '16px',
      '2xl': '18px',
      '3xl': '20px',
      '4xl': '24px',
      '5xl': '28px',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
    },
    lineHeight: {
      tight: '1.4',
      normal: '1.5',
      relaxed: '1.6',
    },
  },

  // Border Radius
  borderRadius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },

  // Light Theme Colors
  light: {
    // Primary Palette
    primary: {
      main: '#1F4FD8',    // Deep Blue
      accent: '#2F6BFF',  // Hive Blue
      hover: '#1A46C7',
      active: '#163BA8',
    },
    
    // Background Colors
    background: {
      main: '#F8FAFC',    // Off-white
      surface: '#FFFFFF', // White
      elevated: '#FFFFFF',
    },
    
    // Text Colors
    text: {
      primary: '#111827',   // Nearly black
      secondary: '#6B7280', // Gray
      muted: '#9CA3AF',     // Light gray
      inverse: '#FFFFFF',   // White text
    },
    
    // Border Colors
    border: {
      light: '#F3F4F6',   // Very light gray
      default: '#E5E7EB', // Light gray
      strong: '#D1D5DB',  // Medium gray
    },
    
    // Semantic Colors
    semantic: {
      success: {
        main: '#22C55E',
        bg: '#F0FDF4',
        border: '#BBF7D0',
      },
      warning: {
        main: '#F59E0B',
        bg: '#FFFBEB',
        border: '#FED7AA',
      },
      info: {
        main: '#3B82F6',
        bg: '#EFF6FF',
        border: '#BFDBFE',
      },
      error: {
        main: '#EF4444',
        bg: '#FEF2F2',
        border: '#FECACA',
      },
    },
    
    // Interactive States
    interactive: {
      hover: '#F9FAFB',
      active: '#F3F4F6',
      focus: '#2F6BFF',
      disabled: '#F3F4F6',
    },
  },

  // Dark Theme Colors
  dark: {
    // Primary Palette
    primary: {
      main: '#3B82F6',    // Bright blue
      accent: '#60A5FA',  // Lighter blue
      hover: '#2563EB',
      active: '#1D4ED8',
    },
    
    // Background Colors
    background: {
      main: '#0F172A',    // Dark slate
      surface: '#1E293B', // Slate
      elevated: '#334155', // Lighter slate
    },
    
    // Text Colors
    text: {
      primary: '#F8FAFC',   // Light
      secondary: '#CBD5E1', // Medium light
      muted: '#94A3B8',     // Medium
      inverse: '#0F172A',   // Dark text
    },
    
    // Border Colors
    border: {
      light: '#334155',   // Dark slate
      default: '#475569', // Medium slate
      strong: '#64748B',  // Lighter slate
    },
    
    // Semantic Colors
    semantic: {
      success: {
        main: '#22C55E',
        bg: '#052E16',
        border: '#14532D',
      },
      warning: {
        main: '#F59E0B',
        bg: '#451A03',
        border: '#92400E',
      },
      info: {
        main: '#3B82F6',
        bg: '#0C1829',
        border: '#1E3A8A',
      },
      error: {
        main: '#EF4444',
        bg: '#450A0A',
        border: '#7F1D1D',
      },
    },
    
    // Interactive States
    interactive: {
      hover: '#334155',
      active: '#475569',
      focus: '#60A5FA',
      disabled: '#1E293B',
    },
  },
} as const;

// CSS Custom Properties Generator
export const generateCSSVariables = (theme: 'light' | 'dark') => {
  const tokens = designTokens[theme];
  const prefix = theme === 'light' ? '' : '--';
  
  return `
    :root {
      /* Primary Colors */
      --color-primary: ${tokens.primary.main};
      --color-primary-hover: ${tokens.primary.hover};
      --color-primary-active: ${tokens.primary.active};
      --color-primary-accent: ${tokens.primary.accent};
      
      /* Background Colors */
      --color-background: ${tokens.background.main};
      --color-surface: ${tokens.background.surface};
      --color-elevated: ${tokens.background.elevated};
      
      /* Text Colors */
      --color-text-primary: ${tokens.text.primary};
      --color-text-secondary: ${tokens.text.secondary};
      --color-text-muted: ${tokens.text.muted};
      --color-text-inverse: ${tokens.text.inverse};
      
      /* Border Colors */
      --color-border-light: ${tokens.border.light};
      --color-border-default: ${tokens.border.default};
      --color-border-strong: ${tokens.border.strong};
      
      /* Semantic Colors */
      --color-success: ${tokens.semantic.success.main};
      --color-success-bg: ${tokens.semantic.success.bg};
      --color-success-border: ${tokens.semantic.success.border};
      
      --color-warning: ${tokens.semantic.warning.main};
      --color-warning-bg: ${tokens.semantic.warning.bg};
      --color-warning-border: ${tokens.semantic.warning.border};
      
      --color-info: ${tokens.semantic.info.main};
      --color-info-bg: ${tokens.semantic.info.bg};
      --color-info-border: ${tokens.semantic.info.border};
      
      --color-error: ${tokens.semantic.error.main};
      --color-error-bg: ${tokens.semantic.error.bg};
      --color-error-border: ${tokens.semantic.error.border};
      
      /* Interactive States */
      --color-interactive-hover: ${tokens.interactive.hover};
      --color-interactive-active: ${tokens.interactive.active};
      --color-interactive-focus: ${tokens.interactive.focus};
      --color-interactive-disabled: ${tokens.interactive.disabled};
      
      /* Spacing */
      --spacing-xs: ${designTokens.spacing.xs};
      --spacing-sm: ${designTokens.spacing.sm};
      --spacing-md: ${designTokens.spacing.md};
      --spacing-lg: ${designTokens.spacing.lg};
      --spacing-xl: ${designTokens.spacing.xl};
      --spacing-xxl: ${designTokens.spacing.xxl};
      
      /* Typography */
      --font-family-sans: ${designTokens.typography.fontFamily.sans};
      --font-family-mono: ${designTokens.typography.fontFamily.mono};
      
      /* Border Radius */
      --radius-sm: ${designTokens.borderRadius.sm};
      --radius-md: ${designTokens.borderRadius.md};
      --radius-lg: ${designTokens.borderRadius.lg};
      --radius-xl: ${designTokens.borderRadius.xl};
      
      /* Shadows */
      --shadow-sm: ${designTokens.shadows.sm};
      --shadow-md: ${designTokens.shadows.md};
      --shadow-lg: ${designTokens.shadows.lg};
    }
  `;
};

export type DesignTokens = typeof designTokens;
export type Theme = 'light' | 'dark';
export type Spacing = keyof typeof designTokens.spacing;
export type FontSize = keyof typeof designTokens.typography.fontSize;
export type FontWeight = keyof typeof designTokens.typography.fontWeight;