# Design System Reference

## Philosophy

- **Calm, modern, brand-like aesthetic**
- **Minimal UI, maximum clarity**
- **Functionality-first** - no tutorials needed
- **Low cognitive load**
- **No gradients, no flashy animations, no gimmicks**

Inspired by: Notion, Linear, Apple Calendar, Stripe

---

## Color Palette

### Backgrounds
```
Primary:   #F9FAFB   (very light grey, almost white)
Card:      #FFFFFF   (pure white)
```

### Text
```
Primary:   #111827   (near-black)
Secondary: #6B7280   (cool grey)
Tertiary:  #9CA3AF   (light grey - labels)
```

### Accent
```
Accent:    #2563EB   (soft blue, not neon)
```

### States
```
Success / Available:  #16A34A   (soft green)
Busy / Inactive:      #9CA3AF   (grey)
Warning / Planning:   #F59E0B   (soft amber)
```

### Borders & Dividers
```
Border:    #E5E7EB
```

---

## Border Radius

```
Small:    8px    (buttons, inputs)
Medium:   12px   (cards)
Large:    16px   (modals)
```

Tailwind: `rounded-sm`, `rounded-md`, `rounded-lg`

---

## Shadows

Very subtle only:

```css
shadow-subtle: 0px 4px 12px rgba(0,0,0,0.04)
```

---

## Typography

### Font Family
```
Primary: Inter
Fallback: system-ui, -apple-system, sans-serif
```

### Weights
```
Regular:   400
SemiBold:  600
```

### Line Height
```
1.4 - 1.6 (comfortable reading)
```

### Sizes (examples)
```
Heading 1:  text-2xl (24px)
Heading 2:  text-lg (18px)
Body:       text-sm (14px)
Small:      text-xs (12px)
```

---

## Spacing

Use **generous whitespace** - avoid dense layouts.

Standard spacing scale (Tailwind):
- `p-3`: 12px
- `p-4`: 16px
- `p-6`: 24px
- `p-8`: 32px

Gap between elements:
- `gap-2`: 8px
- `gap-3`: 12px
- `gap-4`: 16px
- `gap-6`: 24px

---

## Components

### Buttons

**Primary (Accent)**
```tsx
className="px-4 py-3 bg-accent text-white font-semibold rounded-sm 
           hover:bg-accent/90 transition-all"
```

**Secondary (Outline)**
```tsx
className="px-4 py-3 border border-border bg-bg-card text-text-primary 
           font-semibold rounded-sm hover:bg-bg-primary transition-all"
```

### Cards
```tsx
className="bg-bg-card rounded-md p-4 shadow-subtle border border-border"
```

### Inputs
```tsx
className="w-full px-4 py-3 rounded-sm border border-border bg-bg-card 
           text-text-primary placeholder-text-tertiary 
           focus:outline-none focus:ring-2 focus:ring-accent 
           focus:border-transparent transition-all"
```

### Status Badges
```tsx
// Success
className="px-2 py-1 rounded text-xs font-semibold 
           bg-success/10 text-success border border-success/20"

// Warning
className="px-2 py-1 rounded text-xs font-semibold 
           bg-warning/10 text-warning border border-warning/20"

// Busy
className="px-2 py-1 rounded text-xs font-semibold 
           bg-busy/10 text-busy border border-busy/20"
```

---

## Layout

### Container
```tsx
className="px-4 py-6"
```

### Bottom padding (for nav)
```tsx
className="pb-24"
```

### Card spacing
```tsx
className="space-y-4"  // vertical stack
className="gap-3"      // grid/flex
```

---

## Icons

Use **inline SVG** (24x24 default)

```tsx
<svg width="24" height="24" viewBox="0 0 24 24" 
     fill="none" xmlns="http://www.w3.org/2000/svg">
  <path ... stroke="currentColor" strokeWidth="2"/>
</svg>
```

Icon color inherits from text color with `currentColor`.

---

## Interactions

### Hover States
```
Buttons:     opacity 90% or background change
Links:       underline or color change
Cards:       border-accent/30
```

### Focus States
```
ring-2 ring-accent ring-offset-2
```

### Transitions
```
transition-all  (default)
transition-colors (for color-only changes)
```

Duration: Default (150-200ms) - fast, not sluggish

---

## Loading States

### Skeleton
```tsx
className="animate-pulse bg-bg-card rounded h-8 w-32"
```

### Disabled
```tsx
disabled:opacity-50 disabled:cursor-not-allowed
```

---

## Bottom Navigation

- **Height**: 64px (h-16)
- **Background**: white
- **Border**: 1px top, color `border`
- **Active icon**: `text-accent`
- **Inactive icon**: `text-busy`

### Center Button
- Circular, 56px diameter
- Background: `accent`
- Icon: white
- Positioned -mt-8 (floats above bar)
- Shadow: `shadow-subtle`

---

## Mobile-First Principles

1. Design for **mobile screen first**
2. Touch targets: **minimum 44x44px**
3. Font size: **minimum 14px** for body text
4. Avoid hover-only interactions
5. Bottom nav for primary navigation
6. Generous padding on containers (16px minimum)

---

## Accessibility

- Semantic HTML (`<button>`, `<nav>`, `<main>`)
- ARIA labels on icon-only buttons
- Focus visible (keyboard navigation)
- Color contrast: WCAG AA minimum
- Text alternatives for icons

---

## Don'ts

❌ No gradients  
❌ No drop shadows (except `shadow-subtle`)  
❌ No animations (except transitions)  
❌ No decorative fonts  
❌ No bright/neon colors  
❌ No dense layouts  
❌ No complex patterns  

---

## Usage in Code

All tokens are configured in `tailwind.config.ts`:

```typescript
colors: {
  'bg-primary': '#F9FAFB',
  'bg-card': '#FFFFFF',
  'text-primary': '#111827',
  'accent': '#2563EB',
  // ...
}
```

Use them with Tailwind classes:
```tsx
<div className="bg-bg-primary text-text-primary">
  <button className="bg-accent text-white">Click me</button>
</div>
```

---

## Examples

See implemented components:
- `components/BottomNav.tsx` - Navigation design
- `app/(auth)/login/page.tsx` - Form design
- `app/time/page.tsx` - Interactive grid
- `app/page.tsx` - Card layouts

---

**Remember**: When in doubt, use **less**. Simplicity wins.


