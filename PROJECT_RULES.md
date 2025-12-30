# Project Rules & Git Workflow

## Git Workflow Rules

### Branch Protection

**NEVER commit directly to production branches:**
- ❌ `Vercel-pr0` - Production Vercel deployment
- ❌ `Cloudflare-pr0` - Production Cloudflare deployment

**Production branches are READ-ONLY except via merge:**
```bash
# ✅ CORRECT: Merge from dev branch
git checkout Vercel-pr0
git merge vercel-dev
git push origin Vercel-pr0

# ❌ WRONG: Direct commits
git checkout Vercel-pr0
# ... make changes ...
git commit -m "..."  # DON'T DO THIS
```

### Branch Usage

| Branch | Purpose | Who Can Modify | How to Update |
|--------|---------|----------------|---------------|
| `main` | Architecture & docs | Anyone | Direct commits for docs |
| `vercel-dev` | Vercel development | Developers | Direct commits |
| `cloudflare-dev` | Cloudflare development | Developers | Direct commits |
| `Vercel-pr0` | Vercel production | **Merge only** | Merge from `vercel-dev` |
| `Cloudflare-pr0` | Cloudflare production | **Merge only** | Merge from `cloudflare-dev` |

## Commit Message Conventions

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `deploy`: Deployment-related changes

### Examples

**Good:**
```
feat(canvas): Add color selector with red/green/blue/gold themes

- Multicolor button component
- Theme switching functionality
- Color-themed node rendering
```

```
fix(canvas): Resolve performance issues on mobile devices

- Reduce max nodes from 300 to 60
- Optimize connection checks
- Add mobile gesture support
```

```
docs(readme): Update deployment instructions for Vercel
```

**Bad:**
```
updated stuff
```
```
fix
```
```
changes
```

### Rules

1. **Subject line**: 
   - 50 characters or less
   - Start with lowercase (unless proper noun)
   - No period at end
   - Imperative mood ("Add feature" not "Added feature")

2. **Body** (optional but recommended):
   - Explain WHAT and WHY, not HOW
   - Wrap at 72 characters
   - Use bullet points for multiple changes

3. **Scope** (optional):
   - Component name: `canvas`, `header`, `footer`
   - Area: `vercel`, `cloudflare`, `docs`

## Code Quality Rules

### Before Committing

1. **Test locally:**
   ```bash
   # Vercel
   cd vercel && bun run build && bun run dev
   
   # Cloudflare
   cd cloudflare && python3 -m http.server 8000
   ```

2. **Check for errors:**
   ```bash
   # TypeScript/ESLint
   bun run lint
   
   # Build check
   bun run build
   ```

3. **No white text:**
   - All text must use eye-friendly contrast colors
   - Use `rgba(212,223,245,...)` instead of `rgba(255,255,255,...)`
   - Use `rgba(139,155,196,...)` for muted text

4. **Performance:**
   - Canvas max nodes: 60-80 (not 300+)
   - Optimize connection checks
   - Test on mobile devices

### File Organization

- **Keep production branches clean**: Only production-ready code
- **Document breaking changes**: Update README/docs
- **Remove debug code**: No `console.log`, commented code, or test files in production

## Deployment Rules

### Vercel Deployment

1. **Development:**
   ```bash
   git checkout vercel-dev
   # ... make changes ...
   git commit -m "feat(canvas): Add new feature"
   git push origin vercel-dev
   ```

2. **Production:**
   ```bash
   git checkout Vercel-pr0
   git merge vercel-dev
   git push origin Vercel-pr0
   # Vercel auto-deploys
   ```

3. **Verify:**
   - Check deployment logs in Vercel dashboard
   - Test at attest.blue-hand.org
   - Verify all assets load correctly

### Cloudflare Deployment

1. **Development:**
   ```bash
   git checkout cloudflare-dev
   # ... make changes ...
   git commit -m "fix(html): Fix accessibility issue"
   git push origin cloudflare-dev
   ```

2. **Production:**
   ```bash
   git checkout Cloudflare-pr0
   git merge cloudflare-dev
   git push origin Cloudflare-pr0
   # Cloudflare auto-deploys (if connected)
   ```

3. **Manual Deploy (if needed):**
   ```bash
   cd cloudflare
   wrangler pages deploy ./ --project-name=bluehand-solutions
   ```

## Merge Rules

### Before Merging to Production

- [ ] All tests pass locally
- [ ] Build succeeds without errors
- [ ] No console errors in browser
- [ ] Mobile responsive (test on iPhone)
- [ ] Performance acceptable (Lighthouse >90)
- [ ] No white text (eye-friendly colors)
- [ ] Documentation updated if needed

### Merge Process

1. **Create merge commit** (not squash):
   ```bash
   git checkout Vercel-pr0
   git merge --no-ff vercel-dev -m "Merge vercel-dev: [brief description]"
   ```

2. **Review changes:**
   ```bash
   git log Vercel-pr0 ^vercel-dev --oneline
   ```

3. **Push:**
   ```bash
   git push origin Vercel-pr0
   ```

## File Naming Conventions

- **Components**: `kebab-case.tsx` (e.g., `canvas-playground.tsx`)
- **Utilities**: `kebab-case.ts` (e.g., `use-mobile.ts`)
- **Config files**: `lowercase.ext` (e.g., `next.config.mjs`)
- **Documentation**: `UPPERCASE.md` (e.g., `README.md`, `PROJECT_RULES.md`)

## What NOT to Commit

- `node_modules/`
- `.next/` or build artifacts
- `.vercel/` directory
- `*.log` files
- `.DS_Store` or OS files
- Environment files with secrets (`.env.local`)
- Large binary files (use Git LFS if needed)
- Temporary test files

## Emergency Hotfixes

If production is broken and needs immediate fix:

1. **Create hotfix branch from production:**
   ```bash
   git checkout Vercel-pr0
   git checkout -b hotfix/vercel-critical-fix
   ```

2. **Fix and commit:**
   ```bash
   # ... fix the issue ...
   git commit -m "fix(critical): [description of fix]"
   ```

3. **Merge to production:**
   ```bash
   git checkout Vercel-pr0
   git merge hotfix/vercel-critical-fix
   git push origin Vercel-pr0
   ```

4. **Backport to dev:**
   ```bash
   git checkout vercel-dev
   git merge hotfix/vercel-critical-fix
   git push origin vercel-dev
   ```

## Code Review Checklist

Before requesting merge to production:

- [ ] Code follows project style
- [ ] No hardcoded values (use constants/config)
- [ ] Error handling implemented
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Accessibility considered
- [ ] No white text
- [ ] Comments for complex logic
- [ ] TypeScript types defined
- [ ] No console.logs or debug code

## Branch Naming

- **Feature**: `feature/description` (e.g., `feature/canvas-colors`)
- **Fix**: `fix/description` (e.g., `fix/mobile-gestures`)
- **Hotfix**: `hotfix/description` (e.g., `hotfix/vercel-build-error`)
- **Refactor**: `refactor/description` (e.g., `refactor/canvas-performance`)

## Tagging Releases

When ready for a stable release:

```bash
git checkout Vercel-pr0
git tag -a v1.0.0 -m "Release v1.0.0: Production stable"
git push origin v1.0.0
```

## Conflict Resolution

If merge conflicts occur:

1. **Don't force push to production branches**
2. **Resolve conflicts locally:**
   ```bash
   git checkout Vercel-pr0
   git merge vercel-dev
   # Resolve conflicts in files
   git add .
   git commit -m "Merge vercel-dev: Resolved conflicts"
   ```

3. **Verify before pushing:**
   ```bash
   git log --oneline -5
   git diff HEAD~1
   ```

## Best Practices

1. **Small, focused commits**: One logical change per commit
2. **Commit often**: Don't let changes accumulate
3. **Write clear messages**: Future you will thank you
4. **Test before committing**: Don't commit broken code
5. **Keep branches up to date**: Regularly merge main into dev branches
6. **Document decisions**: Update docs when architecture changes
7. **Review your own changes**: `git diff` before committing

## Quick Reference

```bash
# Start new feature
git checkout vercel-dev
git checkout -b feature/new-feature
# ... work ...
git commit -m "feat(scope): Description"
git push origin feature/new-feature

# Merge to dev
git checkout vercel-dev
git merge feature/new-feature
git push origin vercel-dev

# Deploy to production
git checkout Vercel-pr0
git merge vercel-dev
git push origin Vercel-pr0
```

## Enforcement

These rules should be:
- **Reviewed** before merging to production
- **Documented** in PR descriptions
- **Enforced** through code review
- **Updated** as project evolves
