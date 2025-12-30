# Vercel/Next.js Version

This folder contains the Next.js version of the Bluehand Solutions website, built for Vercel deployment.

## Quick Start

1. **Install dependencies:**
   ```bash
   bun install
   ```

2. **Run development server:**
   ```bash
   bun dev
   ```
   Visit http://localhost:3000

3. **Build for production:**
   ```bash
   bun run build
   ```

4. **Deploy to Vercel:**
   ```bash
   bunx vercel
   ```
   Or connect your GitHub repo to Vercel for automatic deployments.

## Project Structure

- `app/` - Next.js 16 app directory (App Router)
  - `page.tsx` - Main page component
  - `layout.tsx` - Root layout
  - `globals.css` - Global styles
  - `api/` - API routes
- `components/` - React components
  - `canvas-background.tsx` - Interactive particle canvas
  - `canvas-playground.tsx` - Constellation playground
  - `contact-form-modal.tsx` - Contact form
  - `app-provider.tsx` - React Context for state management
  - `ui/` - shadcn/ui components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions
- `public/` - Static assets
- `styles/` - Additional stylesheets
- `package.json` - Dependencies (Next.js 16, React 19, Tailwind CSS v4)
- `vercel.json` - Vercel configuration
- `tsconfig.json` - TypeScript configuration

## Tech Stack

- **Framework**: Next.js 16.0.10
- **React**: 19.2.0
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS v4.1.9
- **UI Components**: Radix UI + shadcn/ui
- **Package Manager**: bun (recommended)

## Features

- ✅ Next.js/React conversion with modular components
- ✅ Interactive canvas with particle system and neural connections
- ✅ Constellation canvas playground with drag interactions
- ✅ Contact form modal with email integration
- ✅ Performance optimizations (memoization, visibility API, throttling)
- ✅ Dark theme with glassmorphism design
- ✅ Responsive design
- ✅ Keyboard shortcuts (M/S/B for mode/pulse/burst)

## Development

The project uses:
- **bun** for package management (faster than npm/yarn)
- **TypeScript** for type safety
- **Tailwind CSS v4** for styling
- **App Router** (Next.js 13+ routing)

## Deployment

Vercel will automatically detect this as a Next.js project. The `vercel.json` file configures:
- Build command: `bun run build`
- Dev command: `bun run dev`
- Install command: `bun install`

## See Also

- `../README.md` - Main repository overview
- `../cloudflare/README.md` - Cloudflare static version
- `../docs/` - Shared documentation
