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

### `Cloudflare-pr0`
**Purpose**: Production deployment branch for Cloudflare Pages  
**Status**: **DO NOT MODIFY DIRECTLY** - This is what's deployed to Cloudflare  
**Contains**:
- Production-ready static HTML
- Cloudflare-specific configuration
- Exact state of what's live in production

### `cloudflare-dev`
**Purpose**: Development branch for Cloudflare static site  
**Status**: Active development  
**Contains**:
- Latest Cloudflare static HTML optimizations
- Cloudflare-specific features
- Testing and iteration

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
3. When ready for production:
   ```bash
   git checkout Cloudflare-pr0
   git merge cloudflare-dev
   git push origin Cloudflare-pr0
   ```
4. Cloudflare Pages will auto-deploy from `Cloudflare-pr0` (if connected)

### For Documentation/Architecture:
1. Update `main` branch
2. Keep it as the source of truth for project structure

## Important Notes

- **Never commit directly to `Vercel-pr0` or `Cloudflare-pr0`** - they should only be updated via merge from their respective dev branches
- Production branches should always reflect what's actually deployed
- Use `main` for cross-cutting concerns and documentation
- Each deployment target has its own dev branch for isolation

## Current Production State

### Vercel Production
- **Branch**: `Vercel-pr0`
- **URL**: https://attest.blue-hand.org
- **Status**: Contains production build from bluehand-solutions-website.zip

### Cloudflare Production
- **Branch**: `Cloudflare-pr0`
- **URL**: (Check your Cloudflare dashboard for the deployed URL)
- **Status**: Contains static HTML version currently deployed
