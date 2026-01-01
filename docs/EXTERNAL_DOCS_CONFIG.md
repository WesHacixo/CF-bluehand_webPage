# External Documentation Configuration

**Purpose**: Guide for adding external documentation URLs to Cursor  
**Last Updated**: 2025-01-01

## Overview

This guide explains how to add external documentation URLs to Cursor IDE for better AI context and code generation.

---

## How to Add Documentation URLs

### Step-by-Step Instructions

1. **Open Cursor Settings**
   - Click gear icon (top-right)
   - Or press `Ctrl/⌘ + Shift + J`

2. **Navigate to Documentation**
   - Find "Documentation Integration" section
   - Click "Add Documentation URL"

3. **Add URLs**
   - Enter each URL from the list below
   - Cursor will automatically index the documentation

4. **Verify**
   - Check that URLs are listed
   - Cursor will show indexing status

---

## Recommended Documentation URLs

### Frameworks & Libraries

```
https://nextjs.org/docs
https://react.dev
https://www.typescriptlang.org/docs
https://tailwindcss.com/docs
https://www.radix-ui.com/docs
```

### Tools & Platforms

```
https://bun.sh/docs
https://vercel.com/docs
https://developers.cloudflare.com/pages
https://developers.cloudflare.com/workers/wrangler
```

### Standards & Best Practices

```
https://www.conventionalcommits.org
https://semgrep.dev/docs
https://www.w3.org/WAI/WCAG21/quickref
```

---

## URL Categories

### Essential (Add First)

1. **Next.js** - `https://nextjs.org/docs`
   - App Router patterns
   - Server/Client components
   - API routes

2. **React** - `https://react.dev`
   - Hooks
   - Components
   - Best practices

3. **TypeScript** - `https://www.typescriptlang.org/docs`
   - Type system
   - Advanced types
   - Configuration

### Important (Add Second)

4. **Tailwind CSS** - `https://tailwindcss.com/docs`
   - Utility classes
   - Customization
   - Responsive design

5. **Radix UI** - `https://www.radix-ui.com/docs`
   - Component APIs
   - Accessibility
   - Styling

6. **Bun** - `https://bun.sh/docs`
   - Runtime API
   - Package management
   - Build tools

### Platform-Specific (Add as Needed)

7. **Vercel** - `https://vercel.com/docs`
   - Deployment
   - Configuration
   - Edge functions

8. **Cloudflare Pages** - `https://developers.cloudflare.com/pages`
   - Static site hosting
   - Build configuration
   - Custom domains

9. **Wrangler** - `https://developers.cloudflare.com/workers/wrangler`
   - CLI commands
   - Configuration
   - Deployment

### Standards (Optional)

10. **Conventional Commits** - `https://www.conventionalcommits.org`
    - Commit message format
    - Type definitions

11. **Semgrep** - `https://semgrep.dev/docs`
    - Rule syntax
    - Security patterns

12. **WCAG** - `https://www.w3.org/WAI/WCAG21/quickref`
    - Accessibility guidelines
    - Compliance checklist

---

## Benefits

### Improved AI Context

- Better code generation
- More accurate suggestions
- Framework-aware assistance

### Faster Development

- Less searching for docs
- Context-aware help
- Pattern recognition

### Consistency

- Follows framework best practices
- Uses correct APIs
- Maintains style consistency

---

## Maintenance

### Regular Updates

- **Monthly**: Check for new documentation versions
- **Quarterly**: Review and update URLs
- **As Needed**: Add new frameworks/tools

### Verification

- Test AI suggestions with new docs
- Verify context is being used
- Check indexing status

---

## References

- **Cursor Docs**: https://cursordocs.com/en/docs/settings/ide/overview
- **Documentation Integration**: Cursor Settings → Documentation
- **Project Settings**: `docs/CURSOR_SETTINGS.md`

---

**For complete settings guide, see [CURSOR_SETTINGS.md](./CURSOR_SETTINGS.md)**

