# Golden Nuggets (Main Branch Hub)

This file captures the best artifacts from each production build so `main` stays the source of truth.

## Vercel-pr0 (Next.js)
- **Code**: `vercel/` (Next.js 16.1.1, React 19.2.3) with interactive canvas background, constellation playground, contact modal, Radix/shadcn UI.
- **Assets**: Favicons and placeholders mirrored to `assets/vercel/` (`icons/`, `placeholders/`) for provenance; keep copies in `vercel/public/` for deployment.
- **Docs**: `vercel/README.md` for dev + deploy; shared docs in `docs/` apply here too.

## Cloudflare-pr0 (Static Deployment Package)
- **Artifacts**: Optimized single-page bundle (`cloudflare/index-optimized.html`, `_headers`, `robots.txt`, `sitemap.xml`) plus baseline `index.html`.
- **Strengths**: Security headers + CSP, SEO metadata (OG/Twitter/JSON-LD), accessibility fixes, performance optimizations (see `docs/OPTIMIZATION_SUMMARY.md`).
- **Docs**: Deployment/validation guides in `docs/DEPLOYMENT*.md` and `docs/OPTIMIZATION*.md`.

## Shared Assets (PaaC)
- **Brand**: `assets/images/bluehand-orb-logo.png`, `assets/images/hamsa-cyan.png` (source: Vercel-pr0 production images).
- **Platform-specific**: Vercel favicons/placeholders stored under `assets/vercel/` as reference copies.

## How to Use
- **Pull into branches**: Copy from `assets/` into `vercel/public/` or `cloudflare/` as needed; treat `main` as the catalog.
- **Add new golden items**: Place assets under `assets/`, document in `assets/README.md`, and link here with branch + purpose.
