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
- iPhone-style mock interface with app icons
- Configurable backgrounds (photo/SVG via env vars)
- Image optimization with next/image
- Component-based architecture
- Theme management with persistence
- CI/CD with GitHub Actions (lint/test/build)

### Environment Variables
- `NEXT_PUBLIC_PHONE_WALLPAPER=photo` - Use photorealistic phone wallpaper
- `NEXT_PUBLIC_SITE_WALLPAPER=photo` - Use photorealistic site background

### Code Organization
- `app/` - Next.js App Router pages
- `components/` - Reusable UI components (AppIcon, AppGrid, Dock, PhoneFrame, ThemeProvider)
- `public/` - Static assets (wallpapers, images)
- `docs/` - Project documentation (style guide, progress log)

### Style Guidelines
- Use Tailwind utilities first
- Custom utilities in `app/globals.css` for repeated patterns
- Inline styles only for dynamic values (backgroundImage URLs)
- Component extraction for reusability

### Development Workflow
1. Use VS Code tasks for dev/build/lint
2. Test with `npm test` or `npm run test:watch`
3. Push to `preview` branch for Vercel deployment
4. CI automatically runs on all pushes/PRs
5. Preview: https://tranmer-ca-new-git-preview-tomtranmers-projects.vercel.app
6. Production: https://tranmer-ca-new.vercel.app

### Recent Improvements (Aug 2025)
- ✅ SEO metadata optimization
- ✅ Image performance with next/image
- ✅ Component extraction and modularization
- ✅ Theme management implementation
- ✅ Workflow cleanup (removed redundant deploy hooks)
