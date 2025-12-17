# Voting App Design System

This document outlines the new design system implemented for the Voting App, based on the Hive Admin Dashboard UI Style Guide with enhanced light and dark mode support.

## Overview

The design system provides:
- **Light and Dark Theme Support**: Automatic theme detection with manual toggle
- **Consistent Design Tokens**: Spacing, typography, colors, and component styles
- **Reusable Components**: UI building blocks for consistent application
- **Accessibility**: WCAG AA compliant color contrasts and keyboard navigation
- **Modern Aesthetics**: Clean, professional interface with smooth transitions

## Theme System

### Light Theme (Default)
- **Background**: Off-white (#F8FAFC)
- **Surface**: White (#FFFFFF)
- **Primary**: Deep Blue (#1F4FD8)
- **Text**: Near Black (#111827)
- **Borders**: Light Gray (#E5E7EB)

### Dark Theme
- **Background**: Dark Slate (#0F172A)
- **Surface**: Slate (#1E293B)
- **Primary**: Bright Blue (#3B82F6)
- **Text**: Light (#F8FAFC)
- **Borders**: Medium Slate (#475569)

### Theme Toggle
- Located in the header next to the auth button
- Uses sun/moon icons for intuitive switching
- Persists preference in localStorage
- Respects system preference on first visit

## Design Tokens

### Spacing System (8px base unit)
```css
--spacing-xs: 4px   /* 0.5 * base */
--spacing-sm: 8px   /* 1 * base */
--spacing-md: 16px  /* 2 * base */
--spacing-lg: 24px  /* 3 * base */
--spacing-xl: 32px  /* 4 * base */
--spacing-xxl: 48px /* 6 * base */
```

### Typography Scale
```css
--font-size-xs: 12px
--font-size-sm: 13px
--font-size-base: 14px
--font-size-lg: 15px
--font-size-xl: 16px
--font-size-2xl: 18px
--font-size-3xl: 20px
--font-size-4xl: 24px
--font-size-5xl: 28px

--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
```

### Color Palette

#### Primary Colors
- **Primary**: Main brand color
- **Primary Hover**: Darker shade for hover states
- **Primary Active**: Even darker for active states
- **Primary Accent**: Lighter accent variant

#### Semantic Colors
- **Success**: Green (#22C55E)
- **Warning**: Amber (#F59E0B)
- **Error**: Red (#EF4444)
- **Info**: Blue (#3B82F6)

Each semantic color has background, border, and text variants for proper contrast.

## Component Library

### Button Component
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Create Poll
</Button>
```

**Variants**:
- `primary`: Main action button
- `secondary`: Secondary action
- `ghost`: Subtle action
- `danger`: Destructive action

**Sizes**:
- `sm`: 32px height, small text
- `md`: 40px height, base text
- `lg`: 48px height, large text

### Input Component
```tsx
import { Input } from '@/components/ui';

<Input
  label="Poll Question"
  placeholder="What would you like to ask?"
  error="Question is required"
  inputSize="md"
/>
```

**Features**:
- Built-in label and error handling
- Helper text support
- Disabled state styling
- Focus states with theme-aware colors

### Theme Toggle
```tsx
import { ThemeToggle } from '@/components/ui';

// Already integrated in the main layout
```

## CSS Custom Properties

All design tokens are exposed as CSS custom properties for use in inline styles:

```css
/* Colors */
var(--color-primary)
var(--color-background)
var(--color-text-primary)
var(--color-border-default)

/* Spacing */
var(--spacing-md)
var(--spacing-lg)

/* Typography */
var(--font-size-base)
var(--font-family-sans)
```

## Component Updates

### Updated Components
All existing components have been updated to use the new design system:

- **PageClient**: Main layout with theme toggle
- **PollCard**: Poll display with theme-aware styling
- **CreatePollForm**: Form components with new Input/Button
- **VoteButton**: Action buttons with theme support
- **AuthButton**: Authentication UI with consistent styling
- **PollsContainer**: List layout with status indicators

### New UI Components
- **Button**: Reusable button component
- **Input**: Form input with validation states
- **ThemeToggle**: Theme switching functionality

## Implementation Guide

### Adding New Components

1. Use CSS custom properties for all styling
2. Support both light and dark themes
3. Follow the spacing and typography scale
4. Include proper focus states for accessibility
5. Use semantic HTML elements

```tsx
// Example new component
export function NewComponent() {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--spacing-lg)',
      }}
    >
      <h3 style={{ 
        color: 'var(--color-text-primary)',
        fontSize: 'var(--font-size-lg)',
        fontWeight: '600'
      }}>
        Component Title
      </h3>
    </div>
  );
}
```

### Modifying Existing Components

1. Replace Tailwind classes with CSS custom properties
2. Use the new Button and Input components when appropriate
3. Ensure proper theme support with inline styles
4. Test both light and dark modes

### Theme Persistence

The theme system automatically:
- Detects system preference on first visit
- Saves user preference to localStorage
- Applies theme on page load
- Updates instantly when toggled

## File Structure

```
lib/
  theme-provider.tsx          # Theme context and provider

components/
  ui/
    Button.tsx               # Reusable button component
    Input.tsx                # Form input component
    ThemeToggle.tsx          # Theme switcher
    index.ts                 # Component exports

ui/
  design-tokens.ts           # Design token definitions

app/
  globals.css                # Global styles and CSS variables
  layout.tsx                 # Root layout with theme provider
```

## Accessibility Features

- **WCAG AA Contrast**: All text meets minimum contrast requirements
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Focus Indicators**: Clear focus states for all interactive components
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Reduced Motion**: Respects user's motion preferences

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **CSS Custom Properties**: Required for theme switching
- **ES6 Modules**: Required for component imports
- **LocalStorage**: Required for theme persistence

## Development Guidelines

### CSS Best Practices
1. Use CSS custom properties instead of hardcoded values
2. Follow the 8px spacing system
3. Use semantic color variables (success, warning, error)
4. Include smooth transitions for theme changes
5. Test in both light and dark modes

### Component Development
1. Start with semantic HTML
2. Apply styles with CSS custom properties
3. Include proper TypeScript types
4. Support disabled and loading states
5. Add proper ARIA attributes

### Testing Checklist
- [ ] Light theme appearance
- [ ] Dark theme appearance
- [ ] Theme toggle functionality
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Responsive behavior
- [ ] Focus indicators
- [ ] Hover states

## Migration from Old System

### What Changed
1. **Colors**: Replaced Tailwind color classes with CSS variables
2. **Spacing**: Aligned with 8px base unit system
3. **Typography**: Consistent font sizes and weights
4. **Components**: New reusable UI components
5. **Theme**: Added comprehensive dark mode support

### Breaking Changes
- All components now use inline styles with CSS variables
- Tailwind classes have been replaced where appropriate
- New component API for Button and Input components

### Migration Steps
1. Update existing components to use CSS variables
2. Replace custom styling with new UI components
3. Test all functionality in both themes
4. Update documentation and examples

## Future Enhancements

### Planned Features
- [ ] Component variants (outline, filled, etc.)
- [ ] Animation library with theme-aware transitions
- [ ] Advanced typography scale options
- [ ] High contrast theme option
- [ ] Custom theme builder interface

### Performance Optimizations
- [ ] CSS variable scoping for reduced specificity
- [ ] Critical CSS inlining for faster loading
- [ ] Theme-aware image optimization
- [ ] Reduced bundle size through tree shaking

This design system provides a solid foundation for building consistent, accessible, and beautiful user interfaces that work seamlessly across light and dark themes.