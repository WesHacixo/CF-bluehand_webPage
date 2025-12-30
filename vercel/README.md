# Vercel/Next.js Version

This folder contains the Next.js version of the Bluehand Solutions website, built for Vercel deployment.

## Setup Instructions

1. **Download the code from v0:**
   - Go to https://v0.app/chat/jvj4BJIJ1Ad
   - Look for a "Download" or "Export" button
   - Download the ZIP file
   - Extract all files into this `vercel/` directory

2. **Or use the shadcn CLI:**
   ```bash
   cd vercel
   bunx shadcn@latest add "https://v0.app/chat/b/b_VBoVCODABHr"
   # Follow the prompts to set up the project
   ```

3. **Install dependencies:**
   ```bash
   bun install
   ```

4. **Run development server:**
   ```bash
   bun dev
   ```

5. **Deploy to Vercel:**
   ```bash
   bunx vercel
   ```

## Project Structure

Once the files are added, you should have:
- `app/` - Next.js app directory
- `components/` - React components
- `package.json` - Dependencies
- `vercel.json` - Vercel configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Features

Based on the v0 chat, this version includes:
- Next.js/React conversion with modular components
- Interactive canvas with particle system
- Contact form modal
- Performance optimizations
- Constellation canvas playground at the bottom
