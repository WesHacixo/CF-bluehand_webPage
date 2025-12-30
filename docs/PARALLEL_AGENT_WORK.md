# Parallel Agent Work Conventions

**Version:** 1.0.0  
**Last Updated:** 2025-01-02  
**Status:** Active

## Overview

This document establishes conventions for multiple AI agents working in parallel on different branches of the CF-bluehand_webPage repository. These conventions ensure clean version control, minimize conflicts, and maintain code quality.

---

## Branch Ownership & Scope

### Primary Branch Assignments

| Branch | Agent Scope | Primary Directory | Purpose |
|--------|-------------|-------------------|---------|
| `vercel-dev` | **Vercel Agent** | `vercel/` | Next.js/React development |
| `cloudflare-dev` | **Cloudflare Agent** | `cloudflare/` | Static HTML development |
| `main` | **Any Agent** | `docs/`, root config | Documentation & architecture |

### Branch Isolation Rules

1. **Strict Directory Ownership**
   - `vercel-dev` agent: **ONLY** modifies files in `vercel/` directory
   - `cloudflare-dev` agent: **ONLY** modifies files in `cloudflare/` directory
   - Both agents: Can modify shared files in `docs/` and root (with coordination)

2. **Never Cross Boundaries**
   - Vercel agent must **NOT** modify `cloudflare/` files
   - Cloudflare agent must **NOT** modify `vercel/` files
   - Exception: Shared documentation in `docs/` (requires coordination)

3. **Production Branches**
   - `Vercel-pr0`: Merge-only from `vercel-dev` (Vercel agent coordinates)
   - `Cloudflare-pr0`: Merge-only from `cloudflare-dev` (Cloudflare agent coordinates)
   - **NEVER** commit directly to production branches

---

## Communication Protocols

### Agent Status Tracking

Each agent should maintain a status file in their branch:

**File:** `vercel/.agent-status.md` (for Vercel agent)  
**File:** `cloudflare/.agent-status.md` (for Cloudflare agent)

```markdown
# Agent Status

**Agent:** Vercel Development Agent
**Branch:** vercel-dev
**Last Updated:** 2025-01-02 14:30:00 UTC
**Status:** Active

## Current Work
- Working on: [Brief description]
- Files Modified: [List of files]
- Estimated Completion: [Timeframe]

## Blockers
- None

## Coordination Notes
- [Any notes for other agents]
```

### Shared Communication Channel

**File:** `docs/AGENT_COORDINATION.md`

This file serves as a shared communication log for agent coordination:

```markdown
# Agent Coordination Log

## 2025-01-02

### Vercel Agent
- **14:30** - Working on canvas component optimization
- **15:00** - Modified `vercel/components/canvas-playground.tsx`
- **Note:** No conflicts expected

### Cloudflare Agent
- **14:45** - Working on deployment configuration
- **15:10** - Modified `cloudflare/wrangler.toml`
- **Note:** No conflicts expected
```

**Update Protocol:**
- Agents append entries (don't delete history)
- Use timestamps (UTC)
- Note any potential conflicts
- Clear entries older than 7 days

---

## File Ownership Guidelines

### Exclusive Ownership

| Directory | Owner | Notes |
|-----------|-------|-------|
| `vercel/` | Vercel Agent | Complete ownership, no Cloudflare agent access |
| `cloudflare/` | Cloudflare Agent | Complete ownership, no Vercel agent access |

### Shared Ownership (Requires Coordination)

| Directory/File | Both Agents | Coordination Required |
|----------------|-------------|----------------------|
| `docs/` | ✅ | Yes - use `AGENT_COORDINATION.md` |
| `.cursorrules` | ✅ | Yes - major changes only |
| `README.md` | ✅ | Yes - significant updates |
| `.gitignore` | ✅ | Yes - if adding platform-specific ignores |
| `PROJECT_RULES.md` | ✅ | Yes - any changes |
| `BRANCH_STRATEGY.md` | ✅ | Yes - any changes |

### Coordination Protocol for Shared Files

1. **Check `AGENT_COORDINATION.md`** before modifying shared files
2. **Announce intent** in coordination log
3. **Wait 5 minutes** for response (if urgent, proceed with caution)
4. **Make minimal changes** - only what's necessary
5. **Update coordination log** after changes

---

## Merge Coordination

### Merging to Main

**When:** After completing a feature or fix on dev branch

**Process:**
1. Ensure all changes are committed on dev branch
2. Update `AGENT_COORDINATION.md` with merge intent
3. Switch to `main` branch
4. Merge dev branch: `git merge --no-ff vercel-dev` (or `cloudflare-dev`)
5. Resolve any conflicts (coordinate if needed)
6. Push to `main`
7. Update coordination log

**Merge Message Format:**
```
Merge vercel-dev into main

- Feature: [Description]
- Files Changed: [List]
- Agent: Vercel Development Agent
```

### Merging to Production

**When:** Ready to deploy to production

**Process:**
1. Verify all tests pass on dev branch
2. Update `AGENT_COORDINATION.md` with production merge intent
3. Switch to production branch (`Vercel-pr0` or `Cloudflare-pr0`)
4. Merge dev branch: `git merge --no-ff vercel-dev`
5. Tag the release: `git tag -a v1.x.x -m "Release notes"`
6. Push branch and tags
7. Deploy to production
8. Update coordination log

---

## Conflict Resolution

### Prevention Strategy

1. **Clear Scope Definition**
   - Each agent works in isolated directories
   - Shared files are clearly identified
   - Coordination required for shared files

2. **Frequent Communication**
   - Update `AGENT_COORDINATION.md` regularly
   - Announce major changes before starting
   - Check coordination log before starting work

3. **Atomic Commits**
   - Make small, focused commits
   - One logical change per commit
   - Clear commit messages

### Conflict Resolution Process

**If conflicts occur:**

1. **Identify Conflict Type**
   - **Shared File Conflict**: Requires coordination
   - **Merge Conflict**: Standard git resolution
   - **Scope Violation**: Agent modified wrong directory

2. **For Shared File Conflicts**
   - Check `AGENT_COORDINATION.md` for context
   - Contact other agent (via coordination log)
   - Resolve together or defer to agent with primary ownership

3. **For Merge Conflicts**
   - Standard git merge conflict resolution
   - Prefer changes from the branch being merged
   - Document resolution in commit message

4. **For Scope Violations**
   - Revert unauthorized changes
   - Update coordination log with violation notice
   - Re-apply changes in correct branch/directory

---

## Version Control Best Practices

### Commit Conventions

Follow existing `.cursorrules` commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**
```
feat(canvas): Add color selector with red/green/blue/gold themes

- Implement color picker component
- Add theme switching logic
- Update canvas rendering for new colors

Agent: Vercel Development Agent
Branch: vercel-dev
```

```
fix(deployment): Update wrangler.toml for Pages compatibility

- Remove incompatible [site] section
- Add Pages-specific configuration
- Update deployment documentation

Agent: Cloudflare Development Agent
Branch: cloudflare-dev
```

### Branch Naming

- **Dev branches**: `vercel-dev`, `cloudflare-dev`
- **Production branches**: `Vercel-pr0`, `Cloudflare-pr0`
- **Feature branches**: `vercel-feat/feature-name`, `cloudflare-feat/feature-name`
- **Hotfix branches**: `vercel-hotfix/issue-name`, `cloudflare-hotfix/issue-name`

### Commit Frequency

- **Small, frequent commits** preferred
- Commit after each logical unit of work
- Don't accumulate large changes
- Commit at least once per session

---

## Agent Coordination Patterns

### Pattern 1: Independent Development

**Scenario:** Agents working on completely separate features

**Process:**
1. Each agent works in their directory
2. No coordination needed
3. Update status files independently
4. Merge independently when ready

**Example:**
- Vercel agent: Working on canvas component
- Cloudflare agent: Working on deployment config
- **No conflicts expected**

### Pattern 2: Shared Documentation Update

**Scenario:** Both agents need to update shared docs

**Process:**
1. Agent A announces intent in `AGENT_COORDINATION.md`
2. Agent B reviews and responds
3. Agent A makes changes
4. Agent B merges main, then makes their changes
5. Both coordinate final merge

**Example:**
- Both agents need to update `docs/DEPLOYMENT.md`
- Vercel agent goes first, Cloudflare agent merges and adds their section

### Pattern 3: Cross-Platform Feature

**Scenario:** Feature needs implementation in both platforms

**Process:**
1. Design discussion in `AGENT_COORDINATION.md`
2. Define shared interface/API
3. Each agent implements in their platform
4. Coordinate testing and deployment
5. Update shared documentation together

**Example:**
- New contact form feature
- Vercel: React component implementation
- Cloudflare: Static HTML form implementation
- Shared: API endpoint design

---

## Status Check Protocol

### Daily Status Check

Each agent should update their status file at:
- **Start of session**: Current work plan
- **End of session**: Work completed, next steps
- **Before major merges**: Final status update

### Weekly Coordination Review

**Every Monday:**
1. Review `AGENT_COORDINATION.md` for the past week
2. Identify any conflicts or issues
3. Plan upcoming work
4. Clean up old coordination entries (>7 days)

---

## Emergency Procedures

### Critical Bug in Production

1. **Immediate Action**
   - Agent responsible for platform creates hotfix branch
   - Fix the issue
   - Test thoroughly
   - Merge to production branch immediately

2. **Coordination**
   - Update `AGENT_COORDINATION.md` with emergency notice
   - Document the fix
   - Backport to dev branch after production fix

3. **Post-Mortem**
   - Document in `docs/INCIDENTS.md`
   - Update procedures if needed

### Agent Conflict or Confusion

1. **Stop Work**
   - Don't proceed if uncertain
   - Check `AGENT_COORDINATION.md`
   - Review this document

2. **Clarify**
   - Update coordination log with question
   - Wait for response or proceed with caution
   - Document decision in coordination log

3. **Escalate**
   - If critical, document issue clearly
   - Human review may be needed

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-01-02 | Initial version | Vercel Development Agent |

---

## References

- `.cursorrules` - Project rules and conventions
- `PROJECT_RULES.md` - Git workflow and commit standards
- `BRANCH_STRATEGY.md` - Branch organization
- `docs/AGENT_COORDINATION.md` - Active coordination log

---

## Quick Reference

### Before Starting Work
- [ ] Check current branch (`git branch`)
- [ ] Verify directory ownership
- [ ] Review `AGENT_COORDINATION.md`
- [ ] Update agent status file

### During Work
- [ ] Work only in assigned directory
- [ ] Make small, frequent commits
- [ ] Update coordination log for shared files
- [ ] Follow commit message conventions

### Before Merging
- [ ] All changes committed
- [ ] Tests pass (if applicable)
- [ ] Update coordination log
- [ ] Review merge target branch

### After Merging
- [ ] Update coordination log
- [ ] Update agent status file
- [ ] Tag release (if production merge)
- [ ] Deploy (if production merge)
