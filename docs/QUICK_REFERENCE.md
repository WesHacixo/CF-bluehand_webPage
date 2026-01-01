# Quick Reference Guide

**Bluehand Solutions - Common Commands & Workflows**  
**Last Updated**: 2025-01-01

## Git Workflow

### Branch Operations

```bash
# Check current branch
git branch --show-current

# Switch to dev branch
git checkout vercel-dev
git checkout cloudflare-dev

# Create feature branch
git checkout -b feature/description

# Switch to production (read-only)
git checkout Vercel-pr0
git checkout Cloudflare-pr0
```

### Commits

```bash
# Commit with conventional format
git commit -m "feat(canvas): Add color selector"

# Commit with body
git commit -m "fix(mobile): Resolve gesture handling" -m "- Add touch event handlers" -m "- Optimize for iOS"

# Use commit template
git commit  # Opens .gitmessage template
```

### Merges

```bash
# Merge dev to production
git checkout Vercel-pr0
git merge --no-ff vercel-dev -m "Merge vercel-dev: [description]"
git push origin Vercel-pr0
```

---

## Development Commands

### Vercel (Next.js)

```bash
# Install dependencies
cd vercel && bun install

# Development server
bun run dev

# Build
bun run build

# Lint
bun run lint

# Deploy
bunx vercel
```

### Cloudflare (Static)

```bash
# Local server
cd cloudflare && python3 -m http.server 8000

# Deploy
cd cloudflare
bunx wrangler pages deploy ./ --project-name=bluehand-solutions --commit-dirty=true
```

---

## Security & Quality

### Semgrep Scanning

```bash
# Scan with custom rules
semgrep --config=.semgrep-rules.yml vercel/ cloudflare/

# Scan specific files
semgrep --config=.semgrep-rules.yml vercel/components/canvas-background.tsx
```

### Git Hooks

```bash
# Install hooks
./scripts/install-hooks.sh

# Test pre-commit hook
git commit --allow-empty -m "test: Test commit message"

# Bypass hooks (not recommended)
git commit --no-verify
```

---

## Common Tasks

### Check for White Text

```bash
# Search for white text
grep -r "rgba(255,255,255\|#ffffff\|#fff" vercel/ cloudflare/
```

### Check for console.log

```bash
# Find debug code
grep -r "console\.log" vercel/ cloudflare/
```

### Verify Build

```bash
# Vercel
cd vercel && bun run build

# Check for errors
bun run lint
```

---

## File Locations

### Configuration
- `.cursorrules` - Cursor project rules
- `.gitmessage` - Commit message template
- `.semgrep-rules.yml` - Security rules
- `vercel.json` - Vercel configuration
- `cloudflare/wrangler.toml` - Cloudflare configuration

### Documentation
- `docs/` - All documentation
- `PROJECT_RULES.md` - Project rules
- `BRANCH_STRATEGY.md` - Branch strategy

### Scripts
- `scripts/install-hooks.sh` - Git hooks installation

### Assets
- `assets/` - Shared brand assets (Platform-as-a-Contract)

---

## Branch Strategy Quick Reference

| Branch | Purpose | How to Update |
|--------|---------|---------------|
| `main` | Architecture & docs | Direct commits |
| `vercel-dev` | Vercel development | Direct commits |
| `cloudflare-dev` | Cloudflare development | Direct commits |
| `Vercel-pr0` | Vercel production | Merge from `vercel-dev` |
| `Cloudflare-pr0` | Cloudflare production | Merge from `cloudflare-dev` |

---

## Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `deploy`  
**Scope**: Component name or area (`canvas`, `vercel`, `cloudflare`, `docs`)  
**Subject**: 50 chars or less, lowercase, imperative mood

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
cd vercel
rm -rf .next node_modules
bun install
bun run build
```

### Git Hook Issues
```bash
# Reinstall hooks
./scripts/install-hooks.sh

# Check hook permissions
ls -la .git/hooks/
```

### Security Scan Fails
```bash
# Check Semgrep rules
cat .semgrep-rules.yml

# Run scan manually
semgrep --config=.semgrep-rules.yml vercel/
```

---

## References

- **Full Documentation**: [INDEX.md](./INDEX.md)
- **Project Rules**: [PROJECT_RULES.md](../PROJECT_RULES.md)
- **Branch Strategy**: [BRANCH_STRATEGY.md](../BRANCH_STRATEGY.md)

---

**For detailed guides, see [INDEX.md](./INDEX.md)**

