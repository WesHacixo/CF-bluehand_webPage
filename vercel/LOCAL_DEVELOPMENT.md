# Local Development Setup - Tailscale Funnel

**Branch:** `vercel-dev`  
**Purpose:** Local development server accessible via Tailscale funnel  
**Production:** See `Vercel-pr0` branch for cloud deployment

## Overview

The `vercel-dev` branch is configured for local development with Tailscale funnel access. This allows:
- Local development server running on your machine
- Secure external access via Tailscale funnel (no port forwarding needed)
- Testing with real network conditions
- No cloud deployment costs during development

## Prerequisites

1. **Tailscale installed and running**
   ```bash
   # Check if Tailscale is running
   tailscale status
   ```

2. **Next.js dependencies installed**
   ```bash
   cd vercel
   bun install
   ```

## Development Workflow

### 1. Start Local Development Server

```bash
cd vercel
bun dev
```

This starts the Next.js development server on `http://localhost:3000`

### 2. Create Tailscale Funnel

In a separate terminal, create a Tailscale funnel to expose the local server:

```bash
# Expose localhost:3000 via Tailscale funnel
tailscale funnel 3000
```

This will provide a public URL like:
```
https://[your-machine].ts.net:3000
```

### 3. Access from Anywhere

- **Local access:** `http://localhost:3000`
- **Tailscale network access:** `http://[your-machine].ts.net:3000` (if on Tailscale network)
- **Public funnel access:** `https://[your-machine].ts.net:3000` (via funnel)

## Tailscale Funnel Commands

### Start Funnel
```bash
tailscale funnel 3000
```

### Check Funnel Status
```bash
tailscale funnel status
```

### Stop Funnel
```bash
# Press Ctrl+C in the funnel terminal, or:
tailscale funnel --stop
```

## Development vs Production

| Aspect | vercel-dev (Local) | Vercel-pr0 (Production) |
|--------|-------------------|------------------------|
| **Hosting** | Local machine | Vercel cloud |
| **Access** | Tailscale funnel | `attest.blue-hand.org` |
| **Deployment** | `bun dev` + funnel | GitHub → Vercel auto-deploy |
| **Purpose** | Development & testing | Production website |
| **Cost** | Free (local) | Vercel hosting |

## Troubleshooting

### Funnel Not Working

1. **Check Tailscale status:**
   ```bash
   tailscale status
   ```

2. **Verify funnel is active:**
   ```bash
   tailscale funnel status
   ```

3. **Check if port is in use:**
   ```bash
   lsof -i :3000
   ```

4. **Restart Tailscale:**
   ```bash
   # macOS
   sudo launchctl stop com.tailscale.tailscaled
   sudo launchctl start com.tailscale.tailscaled
   ```

### Development Server Issues

1. **Port already in use:**
   ```bash
   # Kill process on port 3000
   lsof -ti:3000 | xargs kill -9
   ```

2. **Clear Next.js cache:**
   ```bash
   rm -rf vercel/.next
   bun dev
   ```

3. **Reinstall dependencies:**
   ```bash
   rm -rf vercel/node_modules vercel/bun.lock
   bun install
   ```

## Security Notes

⚠️ **Important:** Tailscale funnel exposes your local server to the internet. 

- Only use for development/testing
- Don't expose production data or secrets
- Stop the funnel when not in use
- Use Tailscale ACLs to restrict access if needed

## Best Practices

1. **Start funnel only when needed**
   - Don't leave funnel running when not developing
   - Use `tailscale funnel --stop` when done

2. **Use environment variables**
   - Keep sensitive data in `.env.local` (gitignored)
   - Never commit secrets

3. **Test locally first**
   - Verify everything works on `localhost:3000` before using funnel
   - Check console for errors

4. **Monitor resource usage**
   - Local server uses your machine's resources
   - Close funnel when not actively testing

## Related Documentation

- `../docs/PARALLEL_AGENT_WORK.md` - Agent coordination conventions
- `../vercel/README.md` - Vercel project overview
- `../vercel/package.json` - Dependencies and scripts

## Quick Reference

```bash
# Full development setup
cd vercel
bun install          # Install dependencies
bun dev              # Start dev server (terminal 1)
tailscale funnel 3000 # Expose via funnel (terminal 2)

# Access URLs
# Local: http://localhost:3000
# Funnel: https://[your-machine].ts.net:3000
```
