# Shabbat Dinner - Design Sheet

This document outlines the architecture, design system, and styling conventions of the application.

## 🏗️ Architecture Overview

The project is built as a **Single Page Application (SPA)** using React (loaded via CDN) without a traditional build step like Vite or Webpack.
- **Routing:** Navigation is managed by a numeric `screen` state in `app.js` (e.g., `setScreen(1)`).
- **Styling:** Tailwind CSS (via CDN) with custom configuration for brand colors.
- **Language:** Dual-language support (Hebrew/English) managed by a global `LangContext` and a `translations.js` dictionary.
- **State Management:** A centralized `formData` object at the `App` level collects registration and preference data. It also serves as the global database for the session, containing arrays like `pendingRequests`, `upcomingHostings`, and `postedHostings` to enable interactive dashboard operations (e.g., approving requests, posting new hostings, and profile edits).

---

## 🎨 Design System & UI Elements

The application utilizes a highly cohesive, warm, and inviting aesthetic tailored for mobile devices.

### 1. Color Palette
Defined in Tailwind config inside `index.html`:
- **Brand (Oranges):** Used for primary actions, active states, and highlights. `brand-600` (#c2560e) is the primary button color.
- **Warm (Beiges/Creams):** Used for backgrounds and cards. `warm-50` (#fdf8f4) is the global background color, creating a soft, paper-like feel.

### 2. Typography
- **Font:** `Heebo` (Google Font), selected for excellent Hebrew readability and modern look.
- **Weights:** Ranges from Light (300) to Black (900), relying heavily on bold weights for headers and buttons.

### 3. Core UI Components (`components.js`)
- **`Btn`:** Pill-shaped, heavily rounded buttons with subtle hover/active scale animations.
- **`Card`:** White or lightly tinted containers with soft shadows (`shadow-sm` or `shadow-md`) and large border radii (`rounded-2xl` or `rounded-3xl`).
- **`Input`:** Text inputs with consistent padding, border colors that transition on focus, and built-in error messaging.
- **`StepDots`:** Visual progress indicators used in the host registration wizard.
- **`MultiCheck` & `RadioGroup`:** Custom interactive selection grids that look like clickable tiles rather than standard radio buttons, enhancing touch usability.
- **Icons:** Extensive use of native emojis (🏡, 🕯️, 🍽️, 🪖) for visual hierarchy without needing an external icon library.

### 4. Animations
- **Screen Transitions:** `.screen-enter` class provides a smooth fade and slide-in effect when navigating between screens (`app.js` renders).
- **Micro-interactions:** Buttons and cards use CSS transforms (`active:scale-95`, `hover:scale-105`) to feel responsive and tactile.
