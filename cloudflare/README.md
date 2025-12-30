# Cloudflare Version - Static HTML

This folder contains the static HTML version optimized for Cloudflare Pages deployment.

## Quick Start

```bash
# 1. Install Wrangler (one-time setup, if not using bunx)
bun install -g wrangler

# 2. Login to Cloudflare
bunx wrangler login

# 3. Deploy
bunx wrangler pages deploy ./ --project-name=bluehand-solutions --commit-dirty=true
```

**Done!** Your site is live at `https://[random-id].pages.dev`

## Files

- **index-optimized.html** - Production-ready webpage (31.1KB)
- **_headers** - Security headers (CSP, X-Frame-Options, etc.)
- **_redirects** - URL routing (www → non-www, HTTP → HTTPS)
- **wrangler.toml** - Cloudflare Workers configuration
- **robots.txt** - Search engine directives
- **sitemap.xml** - Sitemap for search engines

## Testing Locally

```bash
# Python
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# Visit: http://localhost:8000/index-optimized.html
```

## Custom Domain Setup

1. In Cloudflare Pages project settings:
   - Custom domains → Add custom domain
   - Enter: bluehand.solutions

2. DNS auto-configures:
   - CNAME record created automatically
   - SSL certificate provisioned (5-15 minutes)

## See Also

- `../docs/DEPLOYMENT.md` - Complete deployment guide
- `../docs/OPTIMIZATION.md` - Performance optimizations
- `../README.md` - Main repository README
