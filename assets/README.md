# Shared Assets

This directory contains brand assets and images that are shared across all branches and platforms.

## Asset Organization

### Brand Assets (`images/`)

These are core brand identity assets that should be available to all branches:

- **`bluehand-orb-logo.png`** (281KB, 720x960)
  - Primary brand logo
  - Source: Production images from attest.blue-hand.org
  - Added: PR #1

- **`hamsa-cyan.png`** (367KB, 921x1382)
  - Brand symbol/icon
  - Source: Production images from attest.blue-hand.org
  - Added: PR #1

## Usage Across Branches

These assets are stored on the `main` branch as part of the Platform-as-a-Contract (PaaC) framework. All branches can reference or copy these assets as needed:

- **Vercel branches**: Can reference from `../assets/images/` or maintain copies in `vercel/public/images/`
- **Cloudflare branches**: Can reference from `../assets/images/` or maintain copies in `cloudflare/`
- **Main branch**: Primary source of truth for shared assets

### Vercel Platform Assets (`vercel/`)

Collected from the production `Vercel-pr0` build so they are versioned alongside shared assets:

- **Favicons**: `apple-icon.png`, `icon-dark-32x32.png`, `icon-light-32x32.png`, `icon.svg` (location: `assets/vercel/icons/`)
- **Placeholders**: `placeholder-logo.(png|svg)`, `placeholder.(jpg|svg)`, `placeholder-user.jpg` (location: `assets/vercel/placeholders/`)

These remain platform-specific but are stored here for provenance. Keep copies in `vercel/public/` for live deployments.

## Adding New Shared Assets

When adding new brand assets or images that should be shared across branches:

1. Add to `assets/images/` on `main` branch
2. Update this README with asset details
3. Consider if branches need copies or can reference from main
4. Document in branch-specific READMEs if needed

## Asset Guidelines

- **File naming**: Use kebab-case (e.g., `bluehand-orb-logo.png`)
- **File sizes**: Optimize images before committing (use tools like ImageOptim, TinyPNG)
- **Formats**: Prefer PNG for logos, JPG for photos, SVG for scalable graphics
- **Documentation**: Include source, dimensions, and usage notes in this README

---

**Last Updated**: 2025-12-30  
**Source**: PR #1 - Production images from attest.blue-hand.org
