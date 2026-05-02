---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code."
---

Comprehensive design guide for web and mobile applications. Contains 50+ styles, 161 color palettes, 57 font pairings, 161 product types with reasoning rules, 99 UX guidelines, and 25 chart types across 10 technology stacks. Searchable database with priority-based recommendations.

This Skill should be used when the task involves **UI structure, visual design decisions, interaction patterns, or user experience quality control**.

### Must Use
- Designing new pages (Landing Page, Dashboard, Admin, SaaS, Mobile App)
- Creating or refactoring UI components (buttons, modals, forms, tables, charts, etc.)
- Choosing color schemes, typography systems, spacing standards, or layout systems
- Reviewing UI code for user experience, accessibility, or visual consistency
- Implementing navigation structures, animations, or responsive behavior

### Recommended
- UI looks "not professional enough" but the reason is unclear
- Receiving feedback on usability or experience
- Pre-launch UI quality optimization
- Aligning cross-platform design (Web / iOS / Android)
- Building design systems or reusable component libraries

### Skip
- Pure backend logic development
- Only involving API or database design
- Performance optimization unrelated to the interface

## Priority Reference

| Priority | Category | Impact | Key Checks |
|----------|----------|--------|------------|
| 1 | Accessibility | CRITICAL | Contrast 4.5:1, Alt text, Keyboard nav, Aria-labels |
| 2 | Touch & Interaction | CRITICAL | Min size 44×44px, 8px+ spacing, Loading feedback |
| 3 | Performance | HIGH | WebP/AVIF, Lazy loading, Reserve space (CLS < 0.1) |
| 4 | Style Selection | HIGH | Match product type, Consistency, SVG icons (no emoji) |
| 5 | Layout & Responsive | HIGH | Mobile-first breakpoints, No horizontal scroll |
| 6 | Typography & Color | MEDIUM | Base 16px, Line-height 1.5, Semantic color tokens |
| 7 | Animation | MEDIUM | Duration 150–300ms, Motion conveys meaning |
| 8 | Forms & Feedback | MEDIUM | Visible labels, Error near field, Progressive disclosure |
| 9 | Navigation Patterns | HIGH | Predictable back, Bottom nav ≤5, Deep linking |
| 10 | Charts & Data | LOW | Legends, Tooltips, Accessible colors |

## Key Rules (iOS/SwiftUI Focus)

### Accessibility
- `color-contrast` — Minimum 4.5:1 ratio for normal text
- `focus-states` — Visible focus rings on interactive elements (Apple HIG)
- `dynamic-type` — Support system text scaling; avoid truncation (Apple Dynamic Type)
- `reduced-motion` — Respect prefers-reduced-motion (Apple Reduced Motion API)
- `voiceover-sr` — Meaningful accessibilityLabel/accessibilityHint; logical reading order

### Touch & Interaction
- `touch-target-size` — Min 44×44pt (Apple HIG)
- `touch-spacing` — Minimum 8px gap between touch targets
- `standard-gestures` — Use platform standard gestures consistently (Apple HIG)
- `system-gestures` — Don't block system gestures (Control Center, back swipe)
- `haptic-feedback` — Use haptic for confirmations; avoid overuse (Apple HIG)
- `safe-area-awareness` — Keep targets away from notch, Dynamic Island, gesture bar

### Style Selection
- `platform-adaptive` — Respect iOS HIG: navigation, controls, typography, motion
- `system-controls` — Prefer native/system controls over fully custom ones (Apple HIG)
- `blur-purpose` — Use blur to indicate background dismissal, not decoration (Apple HIG)
- `primary-action` — One primary CTA per screen; secondary actions visually subordinate

### Animation
- `spring-physics` — Prefer spring/physics-based curves for natural feel (Apple HIG fluid animations)
- `interruptible` — Animations must be interruptible; user tap cancels in-progress animation
- `no-blocking-animation` — Never block user input during animation
- `navigation-direction` — Forward navigation left/up; backward right/down (Apple HIG)
- `modal-motion` — Modals/sheets animate from trigger source for spatial context

### Navigation
- `tab-bar-ios` — Use bottom Tab Bar for top-level navigation (Apple HIG)
- `back-behavior` — Back navigation must be predictable and consistent
- `modal-escape` — Modals must offer clear close/dismiss; swipe-down on mobile
- `gesture-nav-support` — Support iOS swipe-back without conflict
- `state-preservation` — Navigating back must restore scroll position and state

### Forms & Feedback
- `progressive-disclosure` — Reveal complex options progressively (Apple HIG)
- `undo-support` — Allow undo for destructive actions (Apple HIG)
- `sheet-dismiss-confirm` — Confirm before dismissing sheet with unsaved changes
- `destructive-emphasis` — Destructive actions use danger color, visually separated

## Pre-Delivery Checklist (iOS App)

### Visual Quality
- [ ] No emojis used as icons (use SF Symbols / SVG)
- [ ] All icons consistent family and style
- [ ] Semantic theme tokens used (no hardcoded colors)

### Interaction
- [ ] All tappable elements provide pressed feedback
- [ ] Touch targets ≥44×44pt
- [ ] Disabled states visually clear
- [ ] VoiceOver focus order matches visual order

### Light/Dark Mode
- [ ] Primary text contrast ≥4.5:1 in both modes
- [ ] Dividers/borders visible in both modes
- [ ] Both themes tested before delivery

### Layout
- [ ] Safe areas respected for headers, tab bars, bottom CTAs
- [ ] Scroll content not hidden behind fixed bars
- [ ] 4/8pt spacing rhythm maintained
- [ ] Tested on small/large phones + landscape

### Accessibility
- [ ] All meaningful images/icons have accessibilityLabel
- [ ] Dynamic Type supported without layout breakage
- [ ] Reduced motion supported
- [ ] Color is not the only indicator
