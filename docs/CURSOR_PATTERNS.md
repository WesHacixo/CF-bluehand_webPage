# Cursor Tab Optimization Patterns

**Purpose**: Document TypeScript/React patterns for optimal Cursor Tab autocomplete suggestions  
**Last Updated**: 2025-01-01

## Overview

This document outlines preferred code patterns that help Cursor Tab provide better autocomplete suggestions and code generation.

---

## TypeScript Patterns

### Component Definitions

**Preferred Pattern**:
```typescript
"use client"

import { memo, useCallback, useMemo } from "react"
import { useApp } from "./app-provider"

interface ComponentProps {
  title: string
  onAction?: () => void
  variant?: "default" | "primary" | "secondary"
}

function ComponentInner({ title, onAction, variant = "default" }: ComponentProps) {
  const { mode } = useApp()
  
  const handleClick = useCallback(() => {
    onAction?.()
  }, [onAction])
  
  return (
    <div className={`component variant-${variant}`}>
      <h2>{title}</h2>
      <button onClick={handleClick}>Action</button>
    </div>
  )
}

export const Component = memo(ComponentInner)
```

**Key Points**:
- Use `"use client"` for client components
- Define props interface explicitly
- Use `memo()` for performance
- Use `useCallback` for event handlers
- Use `useMemo` for computed values

### Hook Implementations

**Preferred Pattern**:
```typescript
import { useState, useEffect, useCallback } from "react"

interface UseHookOptions {
  initialValue?: string
  onUpdate?: (value: string) => void
}

export function useCustomHook(options: UseHookOptions = {}) {
  const { initialValue = "", onUpdate } = options
  const [value, setValue] = useState(initialValue)
  
  const updateValue = useCallback((newValue: string) => {
    setValue(newValue)
    onUpdate?.(newValue)
  }, [onUpdate])
  
  useEffect(() => {
    // Side effects
  }, [value])
  
  return { value, updateValue }
}
```

---

## React/Next.js Patterns

### Server Components

**Preferred Pattern**:
```typescript
// app/page.tsx (Server Component by default)
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Title",
  description: "Page description"
}

export default function Page() {
  return <div>Server Component Content</div>
}
```

### Client Components

**Preferred Pattern**:
```typescript
"use client"

import { useState } from "react"

export function ClientComponent() {
  const [state, setState] = useState(false)
  
  return (
    <button onClick={() => setState(!state)}>
      {state ? "On" : "Off"}
    </button>
  )
}
```

---

## Canvas-Specific Patterns

### Canvas Component Structure

**Preferred Pattern**:
```typescript
"use client"

import { useEffect, useRef, useCallback } from "react"

interface CanvasProps {
  width?: number
  height?: number
  onReady?: () => void
}

export function CanvasComponent({ width = 800, height = 600, onReady }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // Drawing logic
  }, [])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const animate = () => {
      draw(ctx)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    onReady?.()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [draw, onReady])
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="canvas"
    />
  )
}
```

**Key Points**:
- Use refs for canvas element
- Clean up animation frames
- Handle context errors
- Use `requestAnimationFrame` for animation

---

## Best Practices Summary

1. **Always define types** - Explicit types help Cursor Tab
2. **Use interfaces for objects** - Better autocomplete
3. **Export named functions** - Easier to reference
4. **Add JSDoc comments** - Better context for AI
5. **Use consistent naming** - kebab-case for files, PascalCase for components
6. **Memoize expensive operations** - Performance + better suggestions
7. **Handle errors explicitly** - Try-catch, error boundaries
8. **Use accessibility attributes** - ARIA labels, roles, keyboard nav

---

## References

- **TypeScript Handbook**: https://www.typescriptlang.org/docs
- **React Docs**: https://react.dev
- **Next.js Docs**: https://nextjs.org/docs
- **Radix UI**: https://www.radix-ui.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**For more patterns, see existing components in `vercel/components/`**

