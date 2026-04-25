# SmartCampus Frontend Styling Guide

## Overview
This guide documents the professional, modern styling system used throughout the SmartCampus frontend application. All CSS follows a consistent design system built on Tailwind-inspired utilities and CSS custom properties.

## Design System

### Color Palette

#### Primary Colors
```
--primary-color: #6366f1 (Indigo)
--primary-dark: #4f46e5 (Dark Indigo)
--secondary-color: #10b981 (Emerald/Green)
```

#### Status Colors
```
--danger-color: #ef4444 (Red)
--warning-color: #f59e0b (Amber/Orange)
--info-color: #3b82f6 (Blue)
```

#### Neutral Colors
```
--light-bg: #f8fafc (Light background)
--border-color: #e2e8f0 (Light border)
--text-dark: #1e293b (Dark text)
--text-light: #64748b (Light text)
```

### Spacing
- Padding/Margins follow 4px increments (4, 8, 12, 16, 20, 24, 28, 32, 48px)
- Standard card padding: 24px
- Standard container padding: 24px sides, 32px top/bottom
- Gap between items: 20px (cards), 12px (inline items)

### Typography
- Font Family: System stack - Apple System, Segoe UI, Roboto, etc.
- Base font size: 14px
- Line height: 1.5
- Font weights: 400 (normal), 500 (medium), 600 (semi-bold), 700 (bold)

### Border Radius
```
--radius-sm: 6px
--radius-md: 8px
--radius-lg: 12px
```

### Shadows
```
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
```

## Component Styles

### Buttons
All buttons use the `.btn` base class with modifiers:
- `.btn-primary` - Main action button (indigo)
- `.btn-secondary` - Secondary action (slate)
- `.btn-danger` - Destructive action (red)
- `.btn-success` - Positive action (green)
- `.btn-warning` - Warning action (amber)

**Button States:**
- Default: Normal appearance
- Hover: Elevated shadow, color darkening, slight translateY(-1px)
- Disabled: Opacity 0.5, no cursor interaction

### Cards
- Class: `.card`
- Base padding: 24px
- Border: 1px solid var(--border-color)
- Shadow: --shadow-md
- Hover effect: Elevated to --shadow-lg
- Border radius: 12px

### Tables
- Full-width responsive layout
- Header background: #f1f5f9
- Row hover: #f8fafc background
- Vertical alignment: top
- Cell padding: 16px 20px

### Alerts
- Padding: 16px 20px
- Variants: `.alert-error`, `.alert-success`, `.alert-warning`, `.alert-info`
- Each variant includes background, text color, and subtle border

### Status Badges
Standard badge styling across all pages:

**Booking Status:**
- `.status-pending` - Yellow (#fef3c7 bg, #92400e text)
- `.status-approved` - Green (#dcfce7 bg, #166534 text)
- `.status-rejected` - Red (#fee2e2 bg, #991b1b text)

**Ticket Status:**
- `.ticket-status-open` - Blue (#dbeafe bg, #1e40af text)
- `.ticket-status-in-progress` - Yellow (#fef3c7 bg, #92400e text)
- `.ticket-status-resolved` - Green (#dcfce7 bg, #166534 text)
- `.ticket-status-closed` - Gray (#f3f4f6 bg, #374151 text)

**Resource Status:**
- `.status-available` - Green
- `.status-occupied` - Yellow
- `.status-maintenance` - Red

### Forms
- Input/textarea padding: 10px 12px
- Border: 1px solid var(--border-color)
- Border radius: 8px
- Focus state: Indigo border, light background, soft shadow
- Label font weight: 600
- Label margin-bottom: 8px
- Form groups: Flex column layout with 20px gap between fields

### Navigation
- Navbar background: Indigo gradient (135deg)
- Navbar padding: 16px 24px
- Links padding: 8px 16px
- Link hover: Background rgba(255,255,255,0.2)
- Logo font size: 24px, weight 700

## Grid Layouts

### Responsive Grids
- **Cards Grid**: `repeat(auto-fill, minmax(320px, 1fr))` - 320px cards
- **Dashboard Stats**: `repeat(auto-fit, minmax(240px, 1fr))` - 240px stat cards
- **Resources**: `repeat(auto-fill, minmax(300px, 1fr))` - 300px resource cards
- **Tickets**: `repeat(auto-fill, minmax(340px, 1fr))` - 340px ticket cards
- **Form Grid**: `1fr 1fr` (2 columns) → `1fr` (1 column on mobile)

### Container Max-Width
- Max width: 1400px
- Padding sides: 24px
- Centered with auto margins

## Transitions & Animations
- Standard transition: `all 0.2s ease`
- Card hover: Slight lift with `transform: translateY(-2px)`
- Button hover: Slight lift with `transform: translateY(-1px)`
- Shadow enhancement on hover

## Responsive Design

### Mobile (< 768px)
- Single column layouts where applicable
- Full-width forms
- Simplified navigation
- Reduced spacing
- Stack flex items vertically

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Dark Mode Considerations
Currently not implemented, but color palette chosen for:
- High contrast ratios for accessibility
- Consistent appearance on light backgrounds
- Future dark mode compatibility

## Accessibility
- All colors meet WCAG AA contrast ratios (4.5:1 for text)
- Focus states clearly visible on form inputs
- Semantic HTML with proper heading hierarchy
- Buttons have clear visual distinction

## Usage Examples

### Creating a New Page

1. **CSS File Structure**
```css
.page-container {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  padding: 0 24px;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.page-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 0 24px;
}
```

2. **Card Components**
```css
.custom-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.custom-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

3. **Form Components**
```css
.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
```

## Files Overview

- **App.css** - Global styles, color variables, buttons, cards, tables, alerts
- **Layout.css** - Navbar, main content layout, responsive utilities
- **Login.css** - Login page specific styling with gradient background
- **Dashboard.css** - Dashboard layout, stat cards, content sections
- **Bookings.css** - Booking page cards, forms, status badges
- **Tickets.css** - Ticket cards, forms, priority indicators
- **Resources.css** - Resource grid, type badges, status indicators
- **Notifications.css** - Notification list, filters, notification items

## Future Improvements
- Implement CSS variables for easier theme switching
- Add dark mode support
- Optimize animations for reduced motion preferences
- Consider component library integration (e.g., shadcn/ui)
- Add visual regression tests for styling consistency
