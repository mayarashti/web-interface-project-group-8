# Shabbat Dinner - Design Sheet

This document describes the current UI architecture and visual system for the app.

## Architecture Overview

The project is a React SPA loaded from CDN without a build step.

- **Routing:** Numeric `screen` state in `app.js`.
- **Styling:** Tailwind CDN plus global tokens and shared CSS in `design.css`.
- **Language:** Hebrew/English via `LangContext` and `Translations.JS`.
- **State:** A centralized `formData` object in `App` stores registration, profile, and hosting data for the session.

## Design Direction

The UI should feel calm, premium, approachable, and community-centered. The current direction takes inspiration from Notion clarity, Apple restraint, and Airbnb warmth.

The product language favors:

- generous whitespace
- soft hierarchy
- neutral surfaces
- accessible contrast
- subtle shadows
- medium-radius components
- quiet motion
- responsive, mobile-first layouts

## Design Tokens

### Color

- **Page:** `#FAFAF8`
- **Surface:** `#FFFFFF`
- **Text primary:** `#1F2428`
- **Text secondary:** `#687076`
- **Border:** `#E8E3DC`
- **Primary accent:** muted terracotta `#B86442`
- **Community accent:** sage `#6F8F72`

Brand colors are intentionally restrained. Avoid returning to heavy orange/beige-only screens, strong gradients, or decorative visual noise.

### Typography

- **Primary font:** `Assistant`
- **Fallback:** `Inter`, system UI
- **Page title:** 28/34, bold
- **Section title:** 20/28, semibold/bold
- **Body:** 16/24, regular
- **Small text:** 13/18, regular/medium
- **Buttons:** 15/20, semibold

Typography should stay clear and readable in Hebrew RTL first, with English LTR support.

### Spacing And Shape

- Spacing follows a 4px scale: `4, 8, 12, 16, 24, 32, 48, 64`.
- Cards and inputs use 12-16px radii.
- Full pills are reserved for chips, avatar rings, and compact icon controls.
- Shadows should be very subtle and used only for real elevation.

## Core Components

- **`Btn`:** Solid primary, quiet secondary, and simple ghost/outline variants with small press motion and accessible focus rings.
- **`Card`:** White surface, 1px warm border, medium radius, light shadow.
- **`Input`:** Standard height, soft border, clear focus ring, consistent error/hint styling.
- **`RadioGroup` / `MultiCheck`:** Selected states use a soft tint and border instead of heavy filled blocks.
- **`ScreenLayout`:** Shared mobile-first onboarding layout with progress, title, content, and bottom CTA.
- **`AppHeader`:** Shared header pattern for home/profile surfaces, replacing role-specific header class names in JSX.

## Navigation And Motion

- Home/profile screens use a shared app header with compact icon actions.
- Screen transitions use a subtle fade/vertical slide.
- Micro interactions should be 120-180ms and avoid large scale jumps.
- Respect reduced-motion preferences.

## Responsive Behavior

- Onboarding remains single-column and mobile-first.
- Home/dashboard pages can expand to wider constrained containers.
- The map/detail layout becomes two columns on larger viewports and stacks on mobile.
- Horizontal family previews remain scrollable and touch-friendly.
