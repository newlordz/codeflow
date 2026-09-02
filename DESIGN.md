---
name: Syntactic Motive
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ddb7ff'
  on-tertiary: '#490080'
  tertiary-container: '#b76dff'
  on-tertiary-container: '#400071'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#f0dbff'
  tertiary-fixed-dim: '#ddb7ff'
  on-tertiary-fixed: '#2c0051'
  on-tertiary-fixed-variant: '#6900b3'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 24px
  margin-desktop: 64px
---

## Brand & Style

The design system is engineered for a high-performance programming education environment. It balances the technical precision of a high-end IDE with the motivational psychology of a fitness app. The aesthetic is **Corporate Modern** with **Glassmorphic** accents, prioritizing clarity and focus for long-duration learning sessions.

The target audience consists of aspiring and professional developers who value efficiency and visual polish. The UI should evoke a sense of "flow state"—minimizing distractions while using vibrant color hits and subtle gradients to celebrate progress and cognitive breakthroughs.

## Colors

This design system utilizes a tiered "Developer Dark" palette as the primary experience, with a "Clean Light" high-contrast alternative.

- **Primary (Electric Blue):** Used for critical actions, active states, and focus indicators.
- **Secondary (Emerald Green):** Dedicated to "Success" states, completed lessons, and daily streak visualizations.
- **Tertiary (Amethyst Purple):** Reserved for prestige elements such as certifications, advanced quizzes, and specialized tracks.
- **Neutrals:** Deep Slate and Charcoal tones provide the structural foundation, reducing eye strain during night coding sessions.

Gradients should be used sparingly, primarily on progress bars and achievement badges, blending Primary to Tertiary to signify growth.

## Typography

The typographic system prioritizes legibility and technical hierarchy. 

**Inter** is the workhorse for all UI elements, providing a neutral, modern character that stays out of the way of the content. **JetBrains Mono** is utilized for code blocks, inline technical terms, and metadata labels to provide an immediate visual cue for "computational" information.

On mobile devices, `display-lg` should scale down to 32px to ensure readability and prevent horizontal scrolling. Use `500` weight for medium emphasis in body text to maintain clarity against dark backgrounds.

## Layout & Spacing

The design system employs a **Fluid Grid** model with fixed maximum widths for content readability. 

- **Desktop:** A 12-column grid with 24px gutters. Main content areas (like code editors) should maximize available width, while instructional text is capped at 720px for optimal reading speed.
- **Spacing Rhythm:** Based on a 4px baseline. All margins and paddings must be multiples of 8px to maintain a rhythmic, structured feel.
- **Layout Model:** Use side-bar navigation for quick access to the curriculum tree, with a persistent top bar for progress and streak tracking.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Glassmorphism**. 

1.  **Background:** The lowest layer (Dark: #020617).
2.  **Surface:** Standard cards and containers (Dark: #0F172A).
3.  **Elevated (Glass):** Floating panels, code tooltips, and modals use a semi-transparent background (Background color at 70% opacity) with a `20px` backdrop-blur and a subtle `1px` inner border (white at 10% opacity) to simulate glass.
4.  **Shadows:** Use very soft, large-radius ambient shadows (0px 10px 30px rgba(0,0,0, 0.5)) to lift modals and dropdowns without creating harsh edges.

## Shapes

The shape language is "Professional Soft." The standard corner radius is **8px** (Level 2) for inputs, buttons, and small cards. Larger containers like code editors or course modules use **16px** (Level 2 `rounded-lg`) to appear more approachable. 

Status indicators, such as "Live" tags or "Online" status, should remain fully pill-shaped (Level 3) to distinguish them from interactive buttons.

## Components

- **Buttons:** Primary buttons use a solid Electric Blue fill with white text. Secondary buttons use a ghost style with a 1px Slate border. Success/Streak buttons use an Emerald Green to Teal gradient.
- **Input Fields:** Dark Slate background with a 1px border that glows Electric Blue on focus. Use JetBrains Mono for the input text.
- **Progress Tracking:** Use a thick horizontal bar with a gradient fill (Blue to Purple). Include a "pulse" animation on the active segment.
- **Code Editor:** Integrated styling that mimics VS Code's "Dark Modern" theme. Ensure active line highlighting uses a subtle Slate tint.
- **Streak Badges:** Hexagonal shapes with Tertiary (Purple) glowing borders to denote achievement and gamification.
- **Chips:** Small, low-contrast Slate backgrounds for tags like "Python", "Beginner", or "30 mins".