# Vercel Production Checklist

This document ensures the `Vercel-pr0` branch matches what's deployed to `attest.blue-hand.org`.

## Required Assets

### Images
- [x] `/images/bluehand-orb-logo.png` (287KB) - ✅ Added
- [x] `/images/hamsa-cyan.png` (375KB) - ✅ Added
- [x] `/apple-icon.png` - ✅ Present
- [x] `/icon-dark-32x32.png` - ✅ Present
- [x] `/icon-light-32x32.png` - ✅ Present
- [x] `/icon.svg` - ✅ Present
- [x] Placeholder images - ✅ Present

### Code Structure
- [x] `app/` directory with Next.js App Router
- [x] `components/` with all React components
- [x] `public/` with static assets
- [x] `package.json` with dependencies
- [x] `vercel.json` configuration
- [x] `next.config.mjs` configuration

### API Routes
- [x] `/api/brief` - ✅ Present
- [x] `/api/health` - ✅ Present

## Deployment Verification

To verify the branch matches production:

1. Check deployed assets match:
   ```bash
   curl https://attest.blue-hand.org/images/bluehand-orb-logo.png -o /tmp/test.png
   # Compare with vercel/public/images/bluehand-orb-logo.png
   ```

2. Verify build works:
   ```bash
   cd vercel
   bun install
   bun run build
   ```

3. Check all routes exist:
   - `/` - Main page
   - `/api/brief` - API route
   - `/api/health` - Health check

## Status

**Last Updated**: 2024-12-30
**Branch**: `Vercel-pr0`
**Production URL**: https://attest.blue-hand.org

✅ All production assets are now in the repository.
