# Bluehand.Solutions Style Guide

## Brand Identity

**Tagline:** "Own Your Intelligence"

**Mission:** Sovereign intelligence systems that are local-first, private, and governed by you.

---

## Color Palette

### Primary Colors

```css
--bg0: #050814        /* Deep space black - primary background */
--bg1: #07102a        /* Dark navy - gradient accent */
--ink: #eaf0ff        /* Soft white - primary text */
--muted: #a9b7e6      /* Lavender grey - secondary text */
```

### Glass & Effects

```css
--glass: rgba(10, 18, 45, 0.55)     /* Glass morphism background */
--stroke: rgba(255, 255, 255, 0.12) /* Subtle borders */
--shadow: 0 18px 60px rgba(0, 0, 0, 0.35) /* Depth shadow */
```

### Accent Colors

```css
--accent: #7fb4ff     /* Cyan blue - primary accent */
--accent2: #ffb55a    /* Warm orange - secondary accent */
--accent3: #ff5d7d    /* Rose pink - tertiary accent */
```

### Theme-Specific Colors

```css
sovereign:  rgb(127, 180, 255)  /* Cyan - AI/Intelligence */
pipeline:   rgb(255, 181, 90)   /* Orange - Data/Flow */
mesh:       rgb(255, 93, 125)   /* Pink - Network/Agents */
interface:  rgb(200, 220, 255)  /* Light blue - UX/Human */
research:   rgb(170, 210, 255)  /* Sky blue - Discovery */
startup:    rgb(255, 200, 135)  /* Peach - Innovation */
ip:         rgb(255, 135, 170)  /* Coral - Protection */
privacy:    rgb(170, 255, 220)  /* Mint - Security */
neutral:    rgb(127, 180, 255)  /* Default cyan */
```

---

## Typography

### Font Families

**Primary:** Geist Sans (Variable font)
- Modern, clean, tech-forward aesthetic
- Excellent legibility at all sizes
- OpenType features enabled

**Monospace:** Geist Mono
- Code snippets and technical content
- Maintains visual consistency with Geist Sans

### Font Features

```css
font-feature-settings: "cv02", "cv03", "cv04", "cv11";
font-variant-numeric: tabular-nums;
```

### Type Scale

**Headings:**
- Font weight: 600 (Semibold)
- Letter spacing: -0.025em (tight)
- Line height: 1.2

**Body:**
- Letter spacing: -0.011em (slightly tight)
- Line height: 1.7 (generous for readability)

**Hero Title:**
```css
font-size: clamp(28px, 4.2vw, 52px)
line-height: 1.05
letter-spacing: -0.02em
```

**Body Text:**
```css
font-size: clamp(14px, 1.35vw, 17px)
line-height: relaxed (1.625)
```

**Small/Uppercase Labels:**
```css
font-size: 12px
letter-spacing: 0.12em - 0.22em
text-transform: uppercase
```

---

## Backgrounds

### Primary Background

Multi-layered radial gradients creating depth:

```css
background:
  radial-gradient(ellipse 1400px 1000px at 35% 15%, rgba(127, 180, 255, 0.08), transparent 50%),
  radial-gradient(ellipse 1200px 900px at 70% 60%, rgba(255, 181, 90, 0.05), transparent 50%),
  radial-gradient(ellipse 1000px 800px at 20% 80%, rgba(255, 93, 125, 0.04), transparent 50%),
  radial-gradient(1200px 900px at 40% 20%, var(--bg1), var(--bg0));
```

### Interactive Canvas

Three dynamic theme modes:
1. **Neural** - Particle network with connections
2. **Wireframe** - 3D grid planes with depth
3. **Circuit** - Electronic trace pathways

---

## Components

### Pills (Navigation buttons)

**Default State:**
```css
background: rgba(10, 18, 45, 0.25)
border: 1px solid rgba(255, 255, 255, 0.12)
backdrop-filter: blur(10px)
border-radius: 999px
padding: 10px 12px
```

**Hover State:**
```css
transform: translateY(-2px)
border-color: rgba(127, 180, 255, 0.45)
box-shadow: 0 4px 12px rgba(127, 180, 255, 0.15)
/* Shimmer effect on hover */
```

**Active State:**
```css
border-color: rgba(127, 180, 255, 0.65)
background: rgba(127, 180, 255, 0.15)
box-shadow: 0 0 20px rgba(127, 180, 255, 0.2)
```

### Buttons (.btn)

**Primary Button:**
```css
background: rgba(127, 180, 255, 0.12)
border: 1px solid rgba(127, 180, 255, 0.35)
border-radius: 12px
padding: 12px 14px
font-weight: 600
letter-spacing: 0.06em
text-transform: uppercase
```

**Hover:**
```css
transform: translateY(-2px)
background: rgba(127, 180, 255, 0.2)
box-shadow: 0 8px 16px rgba(127, 180, 255, 0.2)
/* Radial glow effect */
```

### Cards

**Base Style:**
```css
background: rgba(0, 0, 0, 0.18)
border: 1px solid rgba(255, 255, 255, 0.1)
border-radius: 14px
padding: 14px 16px
```

**Hover:**
```css
transform: translateY(-4px)
border-color: rgba(127, 180, 255, 0.35)
box-shadow:
  0 12px 24px rgba(0, 0, 0, 0.3),
  0 0 0 1px rgba(127, 180, 255, 0.1)
/* Radial gradient follows mouse position */
```

### Panels

**Glass Panel:**
```css
background: rgba(10, 18, 45, 0.55)
border: 1px solid rgba(255, 255, 255, 0.12)
backdrop-filter: blur(14px)
border-radius: var(--radius) /* 18px */
box-shadow: var(--shadow)
```

**Fade Overlay:**
Multi-color radial gradient overlay for visual interest

---

## Animations

### Keyframe Animations

**Float:**
- Subtle vertical oscillation
- Duration: 6s
- Use for: Logo, decorative elements

**Pulse Glow:**
- Shadow/filter intensity pulse
- Duration: 3s
- Use for: Brand mark, active elements

**Shimmer:**
- Horizontal light sweep
- Duration: 3s
- Use for: Hover states on pills/buttons

**Fade In Up:**
- Opacity 0 → 1, translateY(20px) → 0
- Duration: 0.6s
- Use for: Page load, section reveals

**Scale In:**
- Scale 0.95 → 1, opacity 0 → 1
- Duration: 0.4s
- Use for: Cards, modals

### Transition Timing

**Default:** `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- Pills: 0.3s
- Buttons: 0.3s
- Cards: 0.4s
- Background: 0.8s

### Staggered Delays

Page load sequence:
```
Header: 0s
Hero Panel: 0.1s
Hero Title: 0.2s
Hero Text: 0.3s
CTA Buttons: 0.4s
Service Cards: 0.5s, 0.6s, 0.7s, 0.8s (staggered)
```

---

## Accessibility

### Reduced Motion

All animations disabled when `prefers-reduced-motion: reduce`:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-* { animation: none; }
  * { transition: none; }
}
```

### Focus States

```css
outline: rgba(127, 180, 255, 0.5)
outline-offset: 2px
```

### Color Contrast

- Primary text (#eaf0ff) on dark bg: AAA rated
- Muted text (#a9b7e6) on dark bg: AA rated
- Interactive elements maintain 3:1 minimum

---

## Interactive States

### Hover Hierarchy

1. **Transform:** Subtle lift (-2px to -4px)
2. **Border:** Brightened accent color
3. **Background:** Slightly more opaque
4. **Shadow:** Colored glow matching accent
5. **Overlay:** Gradient/shimmer effect

### Active/Pressed

- **Transform:** Return to baseline or slight press (0 to +1px)
- **Border:** Maximum brightness
- **Background:** Most opaque state
- **Shadow:** Strongest glow

---

## Spacing System

### Clamp-based Fluid Spacing

```css
padding: clamp(16px, 3vw, 40px)  /* Container padding */
padding: clamp(16px, 2.2vw, 24px) /* Panel padding */
gap: clamp(8px, 2vw, 24px)       /* Between elements */
```

### Grid Layouts

**Hero Section:**
```css
grid-cols-1 lg:grid-cols-[1.35fr_0.65fr]
gap: 8 lg:gap-10
```

**Service Cards:**
```css
grid-cols-1 sm:grid-cols-2
gap: 5 (20px)
```

---

## Logo & Brand Mark

### Brand Mark Component

- Size: 44x44px
- Effects:
  - Animated glow ring (spin-slow, 12s)
  - Pulse ring with breathing glow (3s)
  - Hover scale: 1.1
  - Drop shadow: Multi-layer cyan glow

### Logo Usage

- Always maintain aspect ratio
- Minimum size: 32x32px
- Clear space: 8px minimum
- Glow effects are part of the brand identity

---

## Voice & Tone

### Writing Style

**Headlines:** Bold, declarative, benefit-focused
- "Own Your Intelligence"
- "Private Intelligence. Elegant Systems."

**Body Copy:** Technical but accessible
- Use precise terminology
- Explain complex concepts clearly
- Emphasize sovereignty and control

**CTAs:** Direct, action-oriented
- "Request a Sovereignty Audit"
- "Email Directly"

### Language Guidelines

**Use:**
- Sovereign, local-first, private
- Intelligence, systems, governance
- Elegant, secure, controlled

**Avoid:**
- Cloud-first, external dependency language
- Marketing fluff, jargon without context
- Passive voice when possible

---

## Implementation Notes

### CSS Custom Properties

All colors defined as CSS variables for easy theming:
```css
:root {
  --bg0, --bg1, --ink, --muted, --glass, --stroke
  --accent, --accent2, --accent3
  --radius, --shadow, --mono
}
```

### Font Loading

Geist fonts loaded via `geist/font` package:
```tsx
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
```

### Performance

- Reduced motion support
- Optimized animations (GPU-accelerated transforms)
- Backdrop filters with fallbacks
- Canvas rendering optimizations

---

## File Structure

```
vercel/
├── app/
│   ├── globals.css      # Main styles, animations, components
│   ├── layout.tsx       # Root layout with fonts
│   └── page.tsx         # Home page composition
├── components/
│   ├── brand-mark.tsx   # Animated logo
│   ├── header.tsx       # Navigation
│   ├── hero-section.tsx # Main content
│   └── canvas-background.tsx # Interactive background
└── styles/
    └── globals.css      # Shared styles
```

---

## Version History

**Current Version:** 2.0 - Modern Typography & Dynamic Backgrounds

**Changes:**
- Upgraded to Geist Sans/Mono fonts
- Enhanced multi-layer background gradients
- Added 5 new animation keyframes
- Improved component micro-interactions
- Staggered page load animations
- Accessibility improvements (reduced motion)

---

**Maintained by:** Bluehand Design Team
**Last Updated:** December 2025
