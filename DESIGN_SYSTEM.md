# SDN-EDR Dashboard - Design System

## Overview

The SDN-EDR Dashboard uses a **professional, enterprise-grade design system** with a dark theme optimized for security monitoring. The design emphasizes clarity, accessibility, and real-time data visualization with smooth animations and hover effects.

---

## 1. Typography

### Font Stack
- **Primary Font**: Inter (Regular, Medium, Semibold, Bold)
- **Monospace Font**: JetBrains Mono (for code/IP addresses)

### Text Hierarchy

| Class | Usage | Example |
|-------|-------|---------|
| `.text-heading-lg` | Page titles | "Security Dashboard" |
| `.text-heading-md` | Section titles | Card headers |
| `.text-heading-sm` | Subsection titles | Small headings |
| `.text-title` | Labels & captions | "SECURITY STATUS" |
| `.text-label` | Small labels | Badge text |
| `.text-body-primary` | Main content | Descriptions |
| `.text-body-secondary` | Secondary content | Metadata |
| `.text-caption` | Small or muted text | Timestamps |

---

## 2. Color Palette

### Background Colors
```css
--color-bg-deep: #0a0e27;      /* Main background */
--color-bg-card: #111d3d;      /* Card background */
--color-bg-sidebar: #0d1425;   /* Sidebar background */
--color-bg-hover: #1a2a4a;     /* Hover state */
--color-bg-input: #111d3d;     /* Input fields */
--color-bg-overlay: rgba(10, 14, 39, 0.8);
```

### Primary Brand Colors
```css
--color-cyan: #06b6d4;         /* Primary action & accent */
--color-cyan-light: #22d3ee;   /* Lighter variant */
--color-cyan-dark: #0891b2;    /* Darker variant */
```

### Status Colors
```css
/* Success */
--color-green: #10b981;
--color-green-light: #34d399;

/* Alert/Critical */
--color-red: #ef4444;
--color-red-dark: #dc2626;

/* Warning */
--color-amber: #f59e0b;
--color-amber-light: #fbbf24;
```

### Text Colors
```css
--color-text-primary: #f1f5f9;    /* Main text */
--color-text-secondary: #94a3b8;  /* Secondary text */
--color-text-muted: #64748b;      /* Muted text */
--color-text-hint: #475569;       /* Very subtle */
```

### Borders & Dividers
```css
--color-border: #1e293b;          /* Default border */
--color-border-light: #334155;    /* Light border */
--color-border-lighter: #475569;  /* Lighter border */
```

---

## 3. Components

### Card Component
Reusable container for content sections.

**Variants**: `base`, `cyan`, `green`, `red`, `amber`

```jsx
<Card variant="cyan" className="p-6">
  <CardHeader>
    <CardTitle>Network Traffic</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

**Hover Effect**: Border color increases in opacity, shadow expands

### Badge Component
Status indicators and tags.

**Variants**: `cyan`, `green`, `red`, `amber` (also: `info`, `success`, `danger`, `warning`)

```jsx
<Badge variant="green">Active</Badge>
<Badge variant="red">Alert</Badge>
```

**Hover Effect**: Background opacity increases

### Button Component
Interactive button element with multiple variants.

**Variants**: `primary`, `secondary`, `ghost`
**Sizes**: `sm`, `md`, `lg`

```jsx
<Button variant="primary" size="md">Click me</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
```

**Hover Effect**: 
- Primary: Brightens, lifts upward, enhanced shadow glow
- Secondary: Border brightens, subtle cyan glow
- Ghost: Text color changes to cyan

### Input Component
Form input field with focus states.

```jsx
<Input 
  placeholder="Enter IP address"
  error={false}
  disabled={false}
/>
```

**Focus Effect**: Cyan border, subtle box-shadow with cyan tint

### Badge Status Indicator
Animated pulse indicator.

```jsx
<LivePulse danger={false} size="md" />
```

**Animations**:
- Green (safe): Subtle ping animation
- Red (danger): Urgent ping animation

---

## 4. Animations & Transitions

### Duration Tokens
- `fast`: 150ms
- `base`: 300ms  
- `slow`: 500ms

### Easing Functions
- `smooth`: `cubic-bezier(0.4, 0, 0.2, 1)` — Smooth ease-in-out
- `bounce`: `cubic-bezier(0.68, -0.55, 0.265, 1.55)` — Bouncy effect

### Animation Classes

| Class | Duration | Effect |
|-------|----------|--------|
| `animate-fade-in` | 400ms | Fade in with slight upward motion |
| `animate-slide-in-left` | 400ms | Slide in from left |
| `animate-slide-in-up` | 400ms | Slide in from bottom |
| `animate-scale-in` | 300ms | Scale from 95% to 100% |
| `animate-glow-pulse` | 3s | Pulsing glow effect |
| `animate-ping-soft` | 1.5s | Soft pinging expansion |
| `animate-pulse-subtle` | 3s | Subtle opacity pulse |

### Hover Effect Classes

| Class | Effect |
|-------|--------|
| `hover-lift` | Lifts element on hover with shadow |
| `hover-glow` | Adds cyan glow on hover |
| `hover-scale` | Scales to 105% on hover |
| `hover-brighten` | Increases brightness filter |

---

## 5. Spacing Scale

```css
xs:  0.25rem (4px)
sm:  0.5rem  (8px)
md:  1rem    (16px)
lg:  1.5rem  (24px)
xl:  2rem    (32px)
2xl: 3rem    (48px)
3xl: 4rem    (64px)
```

---

## 6. Border Radius

```css
xs:  0.25rem   (4px)
sm:  0.375rem  (6px)
md:  0.5rem    (8px)
lg:  0.75rem   (12px)
xl:  1rem      (16px)
2xl: 1.5rem    (24px)
```

---

## 7. Shadow System

### Standard Shadows
```css
shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.3)
shadow-md:  0 4px 6px rgba(0, 0, 0, 0.3)
shadow-lg:  0 8px 16px rgba(0, 0, 0, 0.4)
shadow-xl:  0 12px 24px rgba(0, 0, 0, 0.5)
```

### Glow Shadows (Color-specific)
```css
glow-cyan:        30px radius, 8% opacity
glow-cyan-hover:  40px radius, 15% opacity

glow-green:       30px radius, 8% opacity
glow-green-hover: 40px radius, 15% opacity

glow-red:         30px radius, 8% opacity
glow-red-hover:   40px radius, 15% opacity

glow-amber:       30px radius, 8% opacity
glow-amber-hover: 40px radius, 15% opacity
```

---

## 8. Usage Examples

### Dashboard Card with Animation
```jsx
<div className="animate-fade-in">
  <Card variant="cyan" className="hover-lift">
    <CardHeader>
      <CardTitle>Network Status</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-body-secondary">Current activity</p>
    </CardContent>
  </Card>
</div>
```

### Status Indicator
```jsx
<div className="flex items-center gap-2">
  <LivePulse danger={false} size="md" />
  <span className="text-caption">System Online</span>
</div>
```

### Alert Badge
```jsx
<Badge variant="red">Critical Alert</Badge>
```

### Form Field
```jsx
<div className="space-y-2">
  <label className="text-label text-text-secondary">IP Address</label>
  <Input 
    placeholder="192.168.1.1"
    className="text-body-primary"
  />
</div>
```

### Action Buttons
```jsx
<div className="flex gap-3">
  <Button variant="primary">Save Changes</Button>
  <Button variant="secondary">Cancel</Button>
  <Button variant="ghost">Learn More</Button>
</div>
```

---

## 9. State Indicators

### Status Dot Animations
```css
.status-dot-active  → ping animation (green)
.status-dot-warning → pulse-subtle animation (amber)
.status-dot-error   → ping animation (red)
```

---

## 10. Responsive Design

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Grid Layouts
```jsx
{/* KPI Cards: 1 col mobile, 2 col tablet, 4 col desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

{/* Main Content: Full width mobile, 2 col desktop */}
<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
```

---

## 11. Accessibility

### Focus States
All interactive elements include:
- Visible focus ring: `focus:outline-none focus:ring-2 focus:ring-offset-2`
- Proper color contrast ratios (WCAG AA compliant)
- Semantic HTML structure

### Keyboard Navigation
- All buttons and inputs are keyboard accessible
- Tab order follows visual flow
- Escape key closes modals/menus

---

## 12. Best Practices

### Do's ✓
- Use design tokens for consistency
- Apply hover effects to interactive elements
- Animate state changes smoothly
- Maintain 300ms transition duration for most interactions
- Use cyan (#06b6d4) as primary accent color
- Group related content in cards

### Don'ts ✗
- Avoid pure blacks/whites; use theme colors
- Don't animate elements that aren't interactive
- Avoid durations shorter than 150ms for UX
- Don't mix multiple animation styles simultaneously
- Avoid excessive glows or shadows

---

## 13. Color Usage Guidelines

### Cyan (#06b6d4)
- Primary actions
- Active states
- Focus indicators
- Key metrics

### Green (#10b981)
- Success states
- Healthy status
- Active connections
- Positive indicators

### Red (#ef4444)
- Alerts
- Critical errors
- Threats/attacks
- Urgent actions

### Amber (#f59e0b)
- Warnings
- Attention needed
- Moderate alerts
- Info highlights

---

## 14. Fonts

All fonts are loaded from Google Fonts via `index.html`:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
```

---

## References

- **Dashboard**: [src/pages/Dashboard.jsx](src/pages/Dashboard.jsx)
- **Components**: [src/components/ui/](src/components/ui/)
- **Tailwind Config**: [tailwind.config.js](tailwind.config.js)
- **Global Styles**: [src/index.css](src/index.css)
