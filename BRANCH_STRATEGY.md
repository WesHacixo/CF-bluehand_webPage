# Branch Strategy

This repository uses a multi-branch strategy to manage different deployment targets and development workflows.

## Branch Overview

### `main`
**Purpose**: Architecture, guidance, and project overview  
**Status**: Development hub until final product  
**Contains**: 
- Project documentation
- Architecture decisions
- Overall project structure
- Both Cloudflare and Vercel codebases

### `Vercel-pr0`
**Purpose**: Production deployment branch for Vercel  
**Status**: **DO NOT MODIFY DIRECTLY** - This is what's deployed to attest.blue-hand.org  
**Contains**: 
- Production-ready Vercel/Next.js code
- Static assets deployed to Vercel
- Exact state of what's live in production

### `vercel-dev`
**Purpose**: Development branch for Vercel features  
**Status**: Active development  
**Contains**:
- Latest Vercel/Next.js enhancements
- New features and improvements
- Testing and iteration

### `cloudflare-dev`
**Purpose**: Development branch for Cloudflare static site  
**Status**: Active development  
**Contains**:
- Latest Cloudflare static HTML optimizations
- Cloudflare-specific features

## Workflow

### For Vercel Development:
1. Work on `vercel-dev` branch
2. Test and iterate
3. When ready for production:
   ```bash
   git checkout Vercel-pr0
   git merge vercel-dev
   git push origin Vercel-pr0
   ```
4. Vercel will auto-deploy from `Vercel-pr0`

### For Cloudflare Development:
1. Work on `cloudflare-dev` branch
2. Test locally
3. When ready, deploy manually or merge to a Cloudflare production branch

### For Documentation/Architecture:
1. Update `main` branch
2. Keep it as the source of truth for project structure

## Important Notes

- **Never commit directly to `Vercel-pr0`** - it should only be updated via merge from `vercel-dev`
- `Vercel-pr0` should always reflect what's actually deployed to production
- Use `main` for cross-cutting concerns and documentation
- Each deployment target has its own dev branch for isolation

## Current Production State

The production deployment at `attest.blue-hand.org` includes:
- Static assets in `/images/` (bluehand-orb-logo.png, hamsa-cyan.png)
- Next.js ISR pages
- API routes (/api/brief, /api/health)
- Various static assets and chunks

These assets may differ from the development branches.
