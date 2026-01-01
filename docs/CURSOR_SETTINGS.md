# Cursor Settings Guide

**Purpose**: Document Cursor IDE settings and configuration  
**Last Updated**: 2025-01-01

## Overview

This guide documents recommended Cursor IDE settings for optimal development workflow with the Bluehand Solutions project.

---

## External Documentation URLs

### Recommended URLs to Add in Cursor Settings

Add these URLs in Cursor Settings → Documentation Integration:

**Frameworks**:
- `https://nextjs.org/docs` - Next.js documentation
- `https://react.dev` - React documentation
- `https://www.typescriptlang.org/docs` - TypeScript handbook

**Styling & UI**:
- `https://tailwindcss.com/docs` - Tailwind CSS documentation
- `https://www.radix-ui.com/docs` - Radix UI component library

**Tools**:
- `https://bun.sh/docs` - Bun runtime documentation
- `https://vercel.com/docs` - Vercel platform docs
- `https://developers.cloudflare.com/pages` - Cloudflare Pages docs

**Standards**:
- `https://www.conventionalcommits.org` - Commit message conventions
- `https://semgrep.dev/docs` - Semgrep security scanning

### How to Add Documentation URLs

1. Open Cursor Settings (`Ctrl/⌘ + Shift + J`)
2. Navigate to "Documentation Integration"
3. Click "Add Documentation URL"
4. Enter each URL above
5. Cursor will index the documentation for context

---

## Chat & Composer Settings

### Recommended Chat Settings

**Auto-scroll**: Enabled
- Automatically scrolls to latest messages
- Improves conversation flow

**Chat History**: Enabled
- Shows previous conversations
- Provides context for new sessions

**Message Formatting**: Markdown enabled
- Better code block rendering
- Improved readability

### Composer Settings

**Multi-file Editing**: Enabled
- Edit multiple files simultaneously
- Better for refactoring

**Code Generation**: Context-aware
- Uses project patterns
- Follows `.cursorrules` guidelines

**Suggestion Timing**: Balanced
- Not too aggressive
- Not too conservative

---

## Workspace Settings

### TypeScript Configuration

```json
{
  "typescript.tsdk": "vercel/node_modules/typescript/lib",
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true
}
```

### Editor Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## Cursor Tab (Autocomplete) Settings

### Enable Cursor Tab

```json
{
  "cursor.tab.enabled": true
}
```

### Optimization Tips

1. **Use Project Patterns**: Follow patterns in `docs/CURSOR_PATTERNS.md`
2. **Type Everything**: Explicit types improve suggestions
3. **Add JSDoc**: Comments help AI understand context
4. **Consistent Naming**: Follow project conventions

---

## AI Context Settings

### Files to Include

- `vercel/components/` - Component patterns
- `vercel/app/` - App router structure
- `docs/` - Documentation for context
- `.cursorrules` - Project rules

### Files to Exclude

- `node_modules/` - Dependencies
- `.next/` - Build artifacts
- `.vercel/` - Deployment files
- `*.log` - Log files

---

## Best Practices

### For Better AI Suggestions

1. **Keep `.cursorrules` Updated**: Reflects current project state
2. **Use Consistent Patterns**: Follow `docs/CURSOR_PATTERNS.md`
3. **Add Documentation**: JSDoc comments help AI
4. **Type Everything**: Explicit types improve suggestions

### For Better Context

1. **Add External Docs**: Include framework documentation URLs
2. **Keep Docs Current**: Update documentation regularly
3. **Use Clear Names**: Descriptive names help AI understand
4. **Document Complex Logic**: Explain WHY, not just WHAT

---

## References

- **Cursor Documentation**: https://cursordocs.com
- **Project Rules**: `.cursorrules`
- **Code Patterns**: `docs/CURSOR_PATTERNS.md`
- **MCP Resources**: `docs/MCP_RESOURCES_GUIDE.md`

---

**For workspace configuration, see `CF-bluehand_webPage.code-workspace`**

