# Missing Production Assets

The following assets are deployed to production at `attest.blue-hand.org` but are missing from the `Vercel-pr0` branch:

## Missing Images

1. `/images/bluehand-orb-logo.png` (287,519 bytes)
2. `/images/hamsa-cyan.png` (375,656 bytes)

## How to Restore

These images need to be downloaded from production and added to the repository:

```bash
# Download from production
curl -o vercel/public/images/bluehand-orb-logo.png https://attest.blue-hand.org/images/bluehand-orb-logo.png
curl -o vercel/public/images/hamsa-cyan.png https://attest.blue-hand.org/images/hamsa-cyan.png

# Commit to Vercel-pr0 branch
git checkout Vercel-pr0
git add vercel/public/images/
git commit -m "Add missing production images"
git push origin Vercel-pr0
```

## Status

- [ ] Images downloaded
- [ ] Images added to `vercel/public/images/`
- [ ] Committed to `Vercel-pr0` branch
- [ ] Verified in production
