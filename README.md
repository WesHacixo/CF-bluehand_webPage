# Bluehand Solutions - Multi-Platform Deployment

This repository contains both the **Cloudflare** (static HTML) and **Vercel** (Next.js) versions of the Bluehand Solutions website.

## Repository Structure

```
CF-bluehand_webPage/
├── cloudflare/          # Static HTML version for Cloudflare Pages
│   ├── index-optimized.html
│   ├── _headers
│   ├── _redirects
│   ├── wrangler.toml
│   └── ...
├── vercel/              # Next.js version for Vercel
│   ├── app/
│   ├── components/
│   ├── package.json
│   ├── vercel.json
│   └── ...
├── docs/                # Shared documentation
│   ├── DEPLOYMENT.md
│   ├── OPTIMIZATION.md
│   └── ...
└── README.md            # This file
```

## Quick Start

### Cloudflare Deployment

```bash
cd cloudflare
bunx wrangler pages deploy ./ --project-name=bluehand-solutions --commit-dirty=true
```

See `cloudflare/README.md` for detailed instructions.

### Vercel Deployment

```bash
cd vercel
bun install
bunx vercel
```

See `vercel/README.md` for detailed instructions.

## Version Differences

### Cloudflare Version
- **Type**: Static HTML
- **Size**: ~31KB optimized
- **Features**: Single-page site with embedded JavaScript
- **Deployment**: Cloudflare Pages (static hosting)

### Vercel Version
- **Type**: Next.js/React application
- **Framework**: Next.js with React components
- **Features**: 
  - Modular component architecture
  - Interactive canvas with particle system
  - Contact form modal
  - Constellation canvas playground
- **Deployment**: Vercel (Next.js platform)

## Documentation

- `PROJECT_RULES.md` - **Git workflow, commit conventions, and project rules**
- `BRANCH_STRATEGY.md` - Branch organization and usage
- `docs/DEPLOYMENT.md` - Complete deployment guide
- `docs/OPTIMIZATION.md` - Performance optimizations
- `cloudflare/README.md` - Cloudflare-specific docs
- `vercel/README.md` - Vercel-specific docs

## License & Contact

**Project**: Bluehand.Solutions  
**Contact**: hello@bluehand.solutions
