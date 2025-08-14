# Copilot Instructions - tranmer.ca

## Project Overview

This is a modern Next.js portfolio website featuring an iPhone-style interface with optimized performance, proper SEO, and accessibility features.

### Tech Stack
- **Framework:** Next.js 15.4.6 with App Router
- **Styling:** Tailwind CSS v4 with custom utilities
- **Language:** TypeScript
- **Testing:** Vitest with coverage
- **Deployment:** Vercel (automatic on push)
- **Theme:** Dark/light mode with next-themes

### Key Features
- iPhone-style mock interface with interactive app icons and folders
- Progressive Web App (PWA) with offline support and installability
- Configurable backgrounds (photo/SVG via env vars)
- Image optimization with next/image and custom icon support
- Component-based architecture with modular design
- Theme management with persistence (dark/light mode)
- Responsive design: desktop phone frame, mobile full-screen
- Interactive elements: draggable phone, horizontal swipe gestures
- Dynamic dock with contextual labels (lock/unlock)
- External link handling with new window options
- 2x5 app grid with utilities folder organization

### Environment Variables
- `NEXT_PUBLIC_PHONE_WALLPAPER=photo` - Use photorealistic phone wallpaper
- `NEXT_PUBLIC_SITE_WALLPAPER=photo` - Use photorealistic site background

### Code Organization
- `app/` - Next.js App Router pages
- `components/` - Reusable UI components:
  - `AppIcon` - Individual app icons with emoji/image support and external link handling
  - `AppGrid` - 2x5 grid layout for apps and folders
  - `AppFolder` - iOS-style folders with modal preview and app organization
  - `Dock` - Interactive dock with horizontal swipe and dynamic labels
  - `PhoneFrame` - Draggable iPhone container with PWA detection
  - `ThemeProvider` - Dark/light theme management
  - `ThemeToggle` - Theme switching component
- `public/` - Static assets (wallpapers, images, icons, PWA manifest)
- `docs/` - Project documentation (style guide, progress log)

### Style Guidelines
- Use Tailwind utilities first
- Custom utilities in `app/globals.css` for repeated patterns
- Inline styles only for dynamic values (backgroundImage URLs)
- Component extraction for reusability

### Development Workflow
1. **Development**: Use `npm run dev` for local development with Turbopack
2. **Testing**: Use `npm test` or `npm run test:watch` for unit tests
3. **Build & Validate**: Use `npm run build` (includes automatic linting + type checking)
4. **Lint Only**: Use `npm run lint` only when specific lint issues need investigation
5. **Deployment**: Push to `preview` branch for Vercel deployment
6. **CI/CD**: Automatic validation runs on all pushes/PRs

**Note**: Avoid running `npm run lint` multiple times - `npm run build` includes comprehensive validation.

### Deployment URLs
- Preview: https://tranmer-ca-new-git-preview-tomtranmers-projects.vercel.app
- Production: https://tranmer-ca-new.vercel.app

### Recent Improvements (Aug 2025)
- ✅ SEO metadata optimization
- ✅ Image performance with next/image
- ✅ Component extraction and modularization
- ✅ Theme management implementation
- ✅ PWA setup with manifest, service worker, and standalone mode
- ✅ Mobile-responsive design with full viewport optimization
- ✅ Interactive features: draggable phone frame, swipe gestures
- ✅ AppFolder component with modal interface
- ✅ Custom image icons support (e.g., Bradshaw Design with bd_icon.png)
- ✅ Dynamic dock labels (lock/unlock based on app visibility)
- ✅ Horizontal swipe interaction (left to right)
- ✅ New window links for external apps (OfficePools, SB Finance)
- ✅ 2x5 app grid layout with utilities folder positioning
- ✅ Workflow cleanup and efficiency improvements
