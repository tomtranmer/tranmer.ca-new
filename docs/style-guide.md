# Project Style Guide

This project uses Tailwind CSS utilities first, with a few custom utilities for cases that aren’t ergonomic or supported as classes.

Principles
- Prefer Tailwind utilities in JSX.
- Extract only repeated, non-semantic patterns into small utilities.
- Keep component structure in React; avoid deeply nested CSS.
- Inline styles are allowed only for dynamic values (e.g., backgroundImage URLs).

Custom utilities (in app/globals.css)
- .title-drop-shadow
  - Provides a soft drop shadow for titles (filter: drop-shadow(0 1px 8px rgba(0,0,0,0.6))).
- .backdrop-blur-2
  - A subtle 2px backdrop blur for readability overlays.
- .bg-cover-center
  - Convenience for background-size: cover and background-position: center.

Backgrounds
- Site background is controlled by NEXT_PUBLIC_SITE_WALLPAPER (photo|unset), defaulting to `/wallpaper.svg`.
- Phone background is controlled by NEXT_PUBLIC_PHONE_WALLPAPER (photo|unset), defaulting to `/landscape.svg`.
- We keep backgroundImage as an inline style for dynamic URLs; if we ever need to eliminate inline styles, we can switch to a CSS variable approach:
  - Parent style: `style={{ '--bg-image': `url(...)` }}`
  - Utility: `.bg-image-var { background-image: var(--bg-image); }`

Naming
- Utilities: short and descriptive, no prefixes (e.g., `.title-drop-shadow`).
- Components: keep JSX-driven; use Tailwind for composition.
- Colors/gradients: use Tailwind palettes; define additional component classes only if re-used across multiple components.

When to add a utility
- You need an arbitrary value (e.g., drop-shadow or blur) more than once.
- A pattern appears in 3+ places and isn’t expressive with default utilities.

When to keep inline style
- Values that must be computed at runtime (e.g., backgroundImage URL). 

Future improvements
- Extract repeated long class strings into component classes via `@apply` (e.g., `.phone-frame`, `.icon-tile`).
- Introduce a small set of gradient component classes if we standardize the palette for icons.
