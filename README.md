# tranmer.ca - Digital Portfolio

A modern Next.js portfolio website featuring an iPhone-style interface with optimized performance and accessibility.

[![CI](https://github.com/tomtranmer/tranmer.ca-new/actions/workflows/ci.yml/badge.svg)](https://github.com/tomtranmer/tranmer.ca-new/actions/workflows/ci.yml)

**Repository:** https://github.com/tomtranmer/tranmer.ca-new  
**Preview:** https://tranmer-ca-new.vercel.app

## Features

- 📱 **iPhone-style Interface** - Mock mobile app layout with app icons and dock
- 🖼️ **Configurable Backgrounds** - Toggle between SVG and photorealistic wallpapers
- ⚡ **Performance Optimized** - Next.js Image optimization, lazy loading
- 🎨 **Theme Support** - Dark/light mode with user preference persistence
- 🧩 **Component Architecture** - Modular, reusable components
- 🔍 **SEO Optimized** - Proper metadata and search engine visibility
- ✅ **Quality Assurance** - Automated testing, linting, and building

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Configuration

Create `.env.local` to customize wallpapers:

```bash
# Use photorealistic backgrounds
NEXT_PUBLIC_PHONE_WALLPAPER=photo
NEXT_PUBLIC_SITE_WALLPAPER=photo
```

## Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Tech Stack

- **Framework:** Next.js 15.4.6 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Theme:** next-themes for dark/light mode
- **Testing:** Vitest with coverage
- **Deployment:** Vercel (automatic)
- **CI/CD:** GitHub Actions

## Project Structure

```
app/                    # Next.js App Router pages
components/             # Reusable UI components
├── AppIcon.tsx        # Individual app icon component
├── AppGrid.tsx        # Grid layout for app icons
├── Dock.tsx           # Bottom dock component
├── PhoneFrame.tsx     # Main phone container
└── ThemeProvider.tsx  # Theme management wrapper
docs/                  # Project documentation
public/                # Static assets and wallpapers
tests/                 # Test files
```

## VS Code Tasks

Use **Terminal > Run Task** for:

- **Dev** - Start development server (background)
- **Build** - Create production build
- **Lint** - Run ESLint checks

Stop background tasks with `Ctrl+C` in the terminal.

## Deployment

The project automatically deploys to Vercel on pushes to the `preview` branch. No manual deployment configuration needed.

## Documentation

- [Style Guide](./docs/style-guide.md) - Coding conventions and utilities
- [Progress Log](./docs/progress-log.md) - Development history and improvements
