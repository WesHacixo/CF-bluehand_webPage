# Vercel Deployment Guide

## How Vercel Works (2024-2025)

### Auto-Detection
**Yes, Vercel still auto-detects Next.js projects!** You don't need a `vercel.json` file for basic Next.js deployments.

Vercel automatically detects:
- ✅ **Next.js** - If it finds `package.json` with `next` dependency
- ✅ **Build command** - Uses `npm run build` or `pnpm build` from package.json
- ✅ **Output directory** - Automatically uses `.next` for Next.js
- ✅ **Framework** - Detects Next.js and configures accordingly

### When You DON'T Need vercel.json
- Standard Next.js App Router projects (like this one)
- Default build settings work fine
- Standard deployment configuration

### When You DO Need vercel.json
- Custom build commands
- Environment variable configuration
- Custom headers/redirects
- Edge functions configuration
- Multiple build outputs
- Custom install commands (like using `bun` instead of `npm`)

## Current Production Setup

Your production build (`Vercel-pr0` branch) works **without** `vercel.json` because:

1. **Next.js Detection**: Vercel sees `package.json` with `next: "16.0.10"`
2. **Build Script**: Uses `"build": "next build"` from package.json
3. **Auto-Configuration**: Vercel automatically:
   - Sets build command to `pnpm build` (or `npm run build`)
   - Uses `.next` as output directory
   - Configures Node.js runtime
   - Sets up ISR (Incremental Static Regeneration)

## Deployment Process

### Option 1: Git Integration (Recommended)
1. Connect GitHub repo to Vercel dashboard
2. Select `Vercel-pr0` branch for production
3. Vercel auto-detects Next.js
4. Deploys automatically on every push

### Option 2: Vercel CLI
```bash
cd vercel
vercel --prod
```

### Option 3: Pre-built Deployment
```bash
cd vercel
vercel build --prod
vercel deploy --prebuilt --prod
```

## Project Settings in Vercel Dashboard

Even without `vercel.json`, you can configure:
- **Build Command**: Override in dashboard (default: `npm run build`)
- **Install Command**: Override in dashboard (default: `npm install`)
- **Output Directory**: Override in dashboard (default: `.next`)
- **Environment Variables**: Set in dashboard
- **Framework Preset**: Auto-detected as Next.js

## Current Production Configuration

- **Framework**: Next.js (auto-detected)
- **Build Command**: `pnpm build` (from package.json)
- **Output Directory**: `.next` (auto-detected)
- **Node Version**: 24.x (from deployment data)
- **Runtime**: nodejs24.x
- **Regions**: iad1 (US East)

## Best Practices

1. **Keep it simple**: If auto-detection works, don't add `vercel.json`
2. **Use dashboard**: Configure non-standard settings in Vercel dashboard
3. **Environment variables**: Set in dashboard, not in code
4. **Branch strategy**: Use `Vercel-pr0` for production deployments

## Troubleshooting

If deployment fails:
1. Check `package.json` has correct build script
2. Verify `next.config.mjs` is valid
3. Check Vercel dashboard for build logs
4. Ensure all dependencies are in `package.json`
