# Tailwind Design System Project

## Critical Rules
- **Never import from** `organized-components/` - it's reference only
- **Always use gotask as task runner**
- **Always use design tokens** - no hardcoded hex values
- **Development server will be in background check check for app.log file in the base directory**

## Quick Reference
- Theme config: `design-system-app/app/globals.css` (Tailwind v4 `@theme`)
- Components: Radix UI + CVA for variants
- Total: 59 components across 7 categories
- Current focus: Component enhancements (Issue #2)

## Key Patterns to Remember

### Colors
- Use semantic tokens (success, warning, info, destructive)
- Dark mode: Use lighter variants (300-400) for text/icons
- Hover states: `bg-primary-subtle-hover` for menus, `bg-primary` for triggers

### Animations
- Transitions: 200ms (triggers), 150ms (menu items)
- Scale: `active:scale-[0.98]` for buttons
- Chevrons: 180° (dropdowns), 90° (submenus)

### Component Standards
- **Triggers**: Primary bg on hover, scale on active
- **Menu items**: Subtle hover, `rounded-[2px]`, `px-2 py-1.5`
- **Forms**: Focus rings, smooth transitions

## Task Commands
- `task dev-bg` - Start dev server (background)
- `task logs` - View server logs
- `task stop` - Stop all services
- `task restart` - Restart server

## Current Progress
- Enhancing components: 25/59 done (42.4%)
- Active: Form Elements (3/13 complete)
- Details: See `todo/issue-2.md`

## Development Logs
- Development server will be already running check logs in app.log
# Tailwind Design System Guidelines

## Core Principles

1. **Use tokens, not values** - `bg-background` not `bg-white`
2. **Borderless design** - Space and color for hierarchy, not borders
3. **Consistent micro-interactions** - Scale, rotate, and transition effects
4. **Accessible by default** - WCAG 2.1 AA minimum
5. **Performance-first** - Remove heavy effects like backdrop blur

## Color System

### Semantic Color Tokens

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|--------|
| `background` | white | gray-900 (#0f172a) | Page backgrounds |
| `foreground` | gray-900 | gray-50 | Primary text |
| `card` | white | gray-800 (#1e293b) | Card backgrounds |
| `muted` | gray-50 | gray-700 | Muted backgrounds |
| `muted-foreground` | gray-500 | gray-300 | Secondary text |
| `primary` | blue-500 | blue-400 | Primary actions |
| `destructive` | red-600 | red-500 | Destructive actions |
| `success` | green-600 | green-500 | Success states |
| `warning` | orange-500 | orange-500 | Warning states |
| `info` | blue-600 | blue-500 | Informational |

### Key Rules
- Always use tokens: `text-muted-foreground` not `text-gray-500`
- Dark mode uses vibrant colors (500 level) for visibility
- Light backgrounds → dark text, dark backgrounds → light text
- Hover states use defined tokens: `primary-subtle-hover`, `destructive-subtle-hover`

## Layout

### Page Container
```jsx
<div className="container mx-auto px-4 py-12 max-w-7xl">
```

### Spacing Scale
- Small gaps: `space-y-2` or `space-y-4`
- Section breaks: `space-y-8` or `space-y-12`
- Visual hierarchy: spacing > backgrounds > typography > shadows

## Components

### Buttons & Triggers
- **9 button variants**: default, secondary, destructive, outline, ghost, link, success, warning, info
- **No shadows**: Clean, borderless design
- **Scale effects**: 
  - Buttons: `active:scale-[0.99]`
  - Triggers: `data-[state=open]:scale-[0.98]`, `active:scale-[0.97]`
- **Hover colors**:
  - Triggers: `hover:bg-primary hover:text-primary-foreground`
  - Menu items: `hover:bg-primary-subtle-hover`
- **Transitions**: 200ms for triggers, 150ms for menu items

### Common Patterns
```jsx
// Card
<div className="bg-card p-6 space-y-4 shadow-sm rounded-lg">

// Page layout
<div className="container mx-auto px-4 py-12 max-w-7xl">

// Overlay
<div className="bg-background/80 backdrop-blur-sm">
```

## States & Interactions

### Interactive Elements
| Element | Hover | Active | Open | Transition |
|---------|-------|--------|------|------------|
| Button | Color shift | scale-[0.99] | - | 200ms |
| Trigger | bg-primary | scale-[0.97] | scale-[0.98] + primary | 200ms |
| Menu Item | bg-primary-subtle-hover | - | - | 150ms |
| Icon | scale-105 | - | - | 150ms |
| Chevron | - | - | rotate-180 or rotate-90 | 200ms |

### Animation Patterns
- **Easing**: Always use `ease-out` for consistency
- **Open/close**: 200ms open, 150ms close
- **Ripple effect**: Context menu right-click
- **Fade + zoom**: Checkbox/radio indicators

## Dark Mode

- **Backgrounds**: Base (gray-900) → Cards (gray-800) → Muted (gray-700)
- **Colors**: Use 400-500 level for vibrancy against dark backgrounds
- **Overlays**: `bg-background/80 backdrop-blur-sm`

## Quick Reference

✅ **Do**
- Use semantic color tokens
- Apply consistent micro-interactions
- Test in both light/dark themes
- Use borderless design patterns
- Follow established hover states

❌ **Don't**
- Hardcode hex values
- Add button shadows
- Use backdrop blur (performance)
- Create inconsistent animations
- Skip keyboard navigation

## Enhancement Progress
- **Buttons & Actions**: 8/8 ✅
- **Form Elements**: 8/13
- **Feedback**: 5/8
- **Navigation**: 5/9
- **Data Display**: 1/10
- **Total**: 30/59 (50.8%)

For detailed standards, see `design-system-app/DESIGN_STANDARDS.md`# Tailwind CSS v4 Theme - Design System Summary

## 🎨 Theme Overview

This theme was created by analyzing 410 Tailwind UI components to extract the most commonly used design patterns. The theme represents a professional, modern design system based on real-world usage.

## 📊 Key Design Insights

### Color Usage Analysis
- **Primary Text**: `gray-900` (247 uses) - Dark text for maximum readability
- **Secondary Text**: `gray-500` (73 uses) - For less prominent content
- **Background**: `white` (124 uses) - Clean, minimal backgrounds
- **Brand Color**: `indigo-600` (24 uses) - Primary brand interactions

### Spacing System
- **Most Used**: `padding-4` (1rem/16px) - 106 uses
- **Common Margins**: `margin-2` (0.5rem/8px) - 97 uses
- **Layout Spacing**: `gap-3` (0.75rem/12px) - 25 uses

### Typography Patterns
- **Base Size**: `text-sm` (0.875rem) - Most common
- **Weights**: `medium` (500) and `semibold` (600) dominate
- **Line Heights**: Optimized for readability

## 🎯 Design Principles

1. **Consistency**: The theme uses a limited, harmonious color palette
2. **Readability**: High contrast ratios with gray-900 on white
3. **Spacing Rhythm**: 4px base unit creates visual harmony
4. **Modern Aesthetics**: Clean shadows, subtle borders, smooth transitions

## 📁 Generated Files

1. **tailwind-final-theme.json** - Complete theme configuration
2. **theme-variables.css** - CSS custom properties for v4
3. **tailwind.config.v4.js** - Ready-to-use config file

## 🚀 Usage

### For Tailwind CSS v4:
```javascript
import theme from './tailwind-final-theme.json';

export default {
  theme: {
    extend: {
      ...theme
    }
  }
}
```

### CSS Variables:
Include `theme-variables.css` in your main CSS file:
```css
@import './theme-variables.css';
```

## 🎨 Color Palette

### Primary (Blue/Indigo)
- Used for CTAs, links, and interactive elements
- Full spectrum from 50-950 for flexibility

### Grays
- Comprehensive neutral palette
- gray-900 for primary text
- gray-500 for secondary text
- gray-400 for placeholders

### Semantic Colors
- **Success**: Green shades for positive feedback
- **Warning**: Yellow for cautions
- **Error**: Red for errors and destructive actions

## 📏 Spacing Scale

Based on 4px (0.25rem) unit:
- **Micro**: 1-3 (4px-12px)
- **Small**: 4-6 (16px-24px)
- **Medium**: 8-12 (32px-48px)
- **Large**: 16-24 (64px-96px)
- **Extra Large**: 32+ (128px+)

## 🔤 Typography Scale

### Font Sizes
- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px) - Most used
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- Up to **9xl**: 8rem (128px)

### Font Weights
- **normal**: 400
- **medium**: 500 - Common for body text
- **semibold**: 600 - Common for headings
- **bold**: 700

## 🎯 Implementation Tips

1. **Start with the defaults** - The theme is optimized for common use cases
2. **Use semantic colors** - Leverage the color meanings for consistency
3. **Maintain spacing rhythm** - Stick to the spacing scale for harmony
4. **Typography hierarchy** - Use size and weight together for clear hierarchy

## 📈 Component Patterns

Based on analysis of 410 components:
- **Cards**: Use white backgrounds with subtle shadows
- **Buttons**: Primary actions use indigo-600
- **Forms**: Gray borders with focus states
- **Navigation**: Clean, minimal with good spacing

This theme provides a solid foundation for building modern, accessible, and visually consistent interfaces.