"use client"

import { memo, useRef, useEffect, useCallback } from "react"
import { useApp } from "./app-provider"

interface PlaygroundNode {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  life: number
  kind: "node" | "spark" | "trail"
  hue: number
  age: number
}

const THEME_COLORS: Record<string, [number, number, number]> = {
  sovereign: [127, 180, 255],
  pipeline: [255, 181, 90],
  mesh: [255, 93, 125],
  interface: [200, 220, 255],
  research: [170, 210, 255],
  startup: [255, 200, 135],
  ip: [255, 135, 170],
  privacy: [170, 255, 220],
  neutral: [127, 180, 255],
}

function CanvasPlaygroundInner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef<PlaygroundNode[]>([])
  const pointerRef = useRef({
    x: 0,
    y: 0,
    down: false,
    lastX: 0,
    lastY: 0,
    velocity: { x: 0, y: 0 },
    trail: [] as { x: number; y: number; age: number }[],
  })
  const dimensionsRef = useRef({ W: 0, H: 0, DPR: 1 })
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef(performance.now())
  const resizeTimeoutRef = useRef<number | null>(null)

  const { mode, theme, toggleMode, pulseSeal, spawnBurst, cycleBackgroundTheme, backgroundTheme } = useApp()

  const themeColor = THEME_COLORS[theme] || THEME_COLORS.neutral

  const makeNode = useCallback(
    (x: number, y: number, vx = 0, vy = 0, kind: "node" | "spark" | "trail" = "node"): PlaygroundNode => {
      const baseR = kind === "trail" ? 1.5 : kind === "spark" ? 2 : 2.5
      return {
        x,
        y,
        vx: vx + (Math.random() - 0.5) * (kind === "spark" ? 2 : 0.5),
        vy: vy + (Math.random() - 0.5) * (kind === "spark" ? 2 : 0.5),
        r: baseR + Math.random() * (kind === "trail" ? 1 : 2),
        life: kind === "trail" ? 60 : kind === "spark" ? 180 + Math.random() * 120 : Number.POSITIVE_INFINITY,
        kind,
        hue: Math.random() * 60 - 30, // Color variation
        age: 0,
      }
    },
    [],
  )

  const spawnCluster = useCallback(
    (x: number, y: number, count: number, vx = 0, vy = 0) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5
        const dist = 10 + Math.random() * 30
        const nx = x + Math.cos(angle) * dist
        const ny = y + Math.sin(angle) * dist
        nodesRef.current.push(
          makeNode(nx, ny, vx * 0.3 + Math.cos(angle) * 0.5, vy * 0.3 + Math.sin(angle) * 0.5, "spark"),
        )
      }
      // Cap nodes
      if (nodesRef.current.length > 300) {
        nodesRef.current.splice(0, nodesRef.current.length - 300)
      }
    },
    [makeNode],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const resize = () => {
      // Clear any pending resize
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }

      // Debounce resize to prevent excessive calls
      resizeTimeoutRef.current = window.setTimeout(() => {
        // Get canvas element's actual dimensions (not container)
        const canvasRect = canvas.getBoundingClientRect()
        const DPR = Math.min(window.devicePixelRatio || 1, 2)

        // Get dimensions with bounds checking
        let W = Math.floor(canvasRect.width)
        let H = Math.floor(canvasRect.height)

        // Enforce maximum bounds to prevent crashes
        const MAX_WIDTH = 4096
        const MAX_HEIGHT = 4096
        const MIN_WIDTH = 100
        const MIN_HEIGHT = 100

        W = Math.max(MIN_WIDTH, Math.min(W, MAX_WIDTH))
        H = Math.max(MIN_HEIGHT, Math.min(H, MAX_HEIGHT))

        // Only resize if dimensions actually changed (prevent infinite loops)
        if (dimensionsRef.current.W === W && dimensionsRef.current.H === H && dimensionsRef.current.DPR === DPR) {
          return
        }

        // Calculate actual canvas size with DPR
        const canvasWidth = Math.floor(W * DPR)
        const canvasHeight = Math.floor(H * DPR)

        // Set canvas internal size (for rendering)
        canvas.width = canvasWidth
        canvas.height = canvasHeight

        // Set canvas display size (CSS pixels)
        canvas.style.width = W + "px"
        canvas.style.height = H + "px"

        // Set transform for high-DPI
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

        // Update dimensions
        dimensionsRef.current = { W, H, DPR }

        // Clamp existing nodes to new bounds if canvas shrunk
        if (nodesRef.current.length > 0) {
          for (const node of nodesRef.current) {
            node.x = Math.max(0, Math.min(node.x, W))
            node.y = Math.max(0, Math.min(node.y, H))
          }
        }

        // Seed initial constellation only if empty
        if (nodesRef.current.length === 0) {
          for (let i = 0; i < 25; i++) {
            nodesRef.current.push(makeNode(Math.random() * W, Math.random() * H, 0, 0, "node"))
          }
        }
      }, 100)
    }

    resize()

    // Use ResizeObserver for canvas element (more reliable than window resize)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvas) {
          resize()
        }
      }
    })

    resizeObserver.observe(canvas)
    window.addEventListener("resize", resize)

    const getCanvasCoords = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      const t = "touches" in e ? e.touches[0] || e.changedTouches[0] : null
      const clientX = t ? t.clientX : (e as MouseEvent).clientX
      const clientY = t ? t.clientY : (e as MouseEvent).clientY
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }
    }

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const coords = getCanvasCoords(e)
      pointerRef.current.down = true
      pointerRef.current.x = coords.x
      pointerRef.current.y = coords.y
      pointerRef.current.lastX = coords.x
      pointerRef.current.lastY = coords.y
      pointerRef.current.velocity = { x: 0, y: 0 }
      pointerRef.current.trail = []

      // Spawn initial burst on click
      spawnCluster(coords.x, coords.y, 8)
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const coords = getCanvasCoords(e)

      if (pointerRef.current.down) {
        const dx = coords.x - pointerRef.current.lastX
        const dy = coords.y - pointerRef.current.lastY
        const speed = Math.sqrt(dx * dx + dy * dy)

        // Update velocity with smoothing
        pointerRef.current.velocity.x = pointerRef.current.velocity.x * 0.7 + dx * 0.3
        pointerRef.current.velocity.y = pointerRef.current.velocity.y * 0.7 + dy * 0.3

        // Add trail points
        pointerRef.current.trail.push({ x: coords.x, y: coords.y, age: 0 })
        if (pointerRef.current.trail.length > 50) {
          pointerRef.current.trail.shift()
        }

        // Spawn trail particles based on speed
        if (speed > 3) {
          nodesRef.current.push(
            makeNode(
              coords.x,
              coords.y,
              pointerRef.current.velocity.x * 0.1,
              pointerRef.current.velocity.y * 0.1,
              "trail",
            ),
          )
        }

        // Apply force to nearby nodes - attraction when slow, repulsion when fast
        const nodes = nodesRef.current
        const attractionRadius = 180
        const repulsionRadius = 80

        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]
          const ndx = n.x - coords.x
          const ndy = n.y - coords.y
          const dist = Math.sqrt(ndx * ndx + ndy * ndy)

          if (dist < attractionRadius && dist > 0) {
            const normalizedDx = ndx / dist
            const normalizedDy = ndy / dist

            if (speed > 15 && dist < repulsionRadius) {
              // Fast drag = explosive repulsion
              const force = (1 - dist / repulsionRadius) * 0.8
              n.vx += normalizedDx * force * (speed * 0.05)
              n.vy += normalizedDy * force * (speed * 0.05)
            } else if (speed < 8) {
              // Slow drag = gentle attraction (gravitational pull)
              const force = (1 - dist / attractionRadius) * 0.15
              n.vx -= normalizedDx * force
              n.vy -= normalizedDy * force
            } else {
              // Medium speed = swirl effect
              const force = (1 - dist / attractionRadius) * 0.1
              n.vx += normalizedDy * force * Math.sign(dx)
              n.vy -= normalizedDx * force * Math.sign(dx)
            }
          }
        }

        // Spawn sparks on fast movement
        if (speed > 20 && Math.random() > 0.5) {
          spawnCluster(coords.x, coords.y, 3, pointerRef.current.velocity.x, pointerRef.current.velocity.y)
        }

        pointerRef.current.lastX = coords.x
        pointerRef.current.lastY = coords.y
      }

      pointerRef.current.x = coords.x
      pointerRef.current.y = coords.y
    }

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (pointerRef.current.down) {
        const vx = pointerRef.current.velocity.x
        const vy = pointerRef.current.velocity.y
        const speed = Math.sqrt(vx * vx + vy * vy)

        // Release burst based on accumulated velocity
        if (speed > 5) {
          const coords = getCanvasCoords(e)
          spawnCluster(coords.x, coords.y, Math.min(20, Math.floor(speed)), vx * 0.5, vy * 0.5)
        }
      }
      pointerRef.current.down = false
    }

    canvas.addEventListener("mousedown", onPointerDown)
    canvas.addEventListener("mousemove", onPointerMove)
    canvas.addEventListener("mouseup", onPointerUp)
    canvas.addEventListener("mouseleave", onPointerUp)
    canvas.addEventListener("touchstart", onPointerDown, { passive: true })
    canvas.addEventListener("touchmove", onPointerMove, { passive: true })
    canvas.addEventListener("touchend", onPointerUp)

    // Animation loop
    const step = (t: number) => {
      const dt = Math.min(0.05, (t - lastTimeRef.current) / 1000)
      lastTimeRef.current = t

      const { W, H } = dimensionsRef.current
      ctx.clearRect(0, 0, W, H)

      // Subtle background
      ctx.fillStyle = "rgba(5, 8, 20, 0.3)"
      ctx.fillRect(0, 0, W, H)

      const nodes = nodesRef.current
      const [r, g, b] = themeColor
      const isLive = mode === "live"
      const maxDist = isLive ? 160 : 120

      // Update and age trail
      const trail = pointerRef.current.trail
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += dt * 60
        if (trail[i].age > 30) {
          trail.splice(i, 1)
        }
      }

      // Draw pointer trail when dragging
      if (pointerRef.current.down && trail.length > 1) {
        ctx.beginPath()
        ctx.moveTo(trail[0].x, trail[0].y)
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y)
        }
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.stroke()
      }

      // Update nodes
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i]
        n.age += dt * 60

        // Apply physics
        const friction = n.kind === "trail" ? 0.92 : 0.98
        n.vx *= friction
        n.vy *= friction

        // Gentle random drift for permanent nodes
        if (n.kind === "node") {
          n.vx += (Math.random() - 0.5) * 0.02
          n.vy += (Math.random() - 0.5) * 0.02
        }

        n.x += n.vx
        n.y += n.vy

        // Soft boundary bounce
        const margin = 20
        if (n.x < margin) {
          n.x = margin
          n.vx *= -0.5
        } else if (n.x > W - margin) {
          n.x = W - margin
          n.vx *= -0.5
        }
        if (n.y < margin) {
          n.y = margin
          n.vy *= -0.5
        } else if (n.y > H - margin) {
          n.y = H - margin
          n.vy *= -0.5
        }

        // Lifespan
        if (n.life !== Number.POSITIVE_INFINITY) {
          n.life -= 60 * dt
          if (n.life <= 0) {
            nodes.splice(i, 1)
            continue
          }
        }

        // Node merging - when nodes get very close, they can merge
        if (n.kind === "spark" && n.age > 60) {
          for (let j = 0; j < nodes.length; j++) {
            if (i === j) continue
            const other = nodes[j]
            if (other.kind !== "node") continue
            const dx = n.x - other.x
            const dy = n.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 15) {
              // Merge: transfer momentum and grow the node slightly
              other.vx = (other.vx + n.vx * 0.3) * 0.8
              other.vy = (other.vy + n.vy * 0.3) * 0.8
              other.r = Math.min(6, other.r + 0.1)
              nodes.splice(i, 1)
              break
            }
          }
        }
      }

      // Draw connections with glow effect
      let linkCount = 0
      ctx.lineWidth = 1

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        if (a.kind === "trail") continue

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          if (b.kind === "trail") continue

          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (a.kind === "spark" || b.kind === "spark" ? 0.15 : 0.25)
            ctx.strokeStyle = `rgba(${r + a.hue}, ${g}, ${b.hue > 0 ? b : b}, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
            linkCount++
          }
        }
      }

      // Draw nodes with glow
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        let alpha = 1
        let radius = n.r

        if (n.kind === "trail") {
          alpha = Math.max(0, n.life / 60) * 0.6
          radius = n.r * (n.life / 60)
        } else if (n.kind === "spark") {
          alpha = Math.min(1, n.life / 100) * 0.8
        }

        // Glow
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, radius * 3)
        gradient.addColorStop(0, `rgba(${r + n.hue}, ${g}, ${b}, ${alpha * 0.4})`)
        gradient.addColorStop(1, `rgba(${r + n.hue}, ${g}, ${b}, 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(n.x, n.y, radius * 3, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = `rgba(${200 + n.hue}, 220, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw cursor influence area when dragging
      if (pointerRef.current.down) {
        const { x, y, velocity } = pointerRef.current
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
        const radius = speed > 15 ? 80 : 180

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${speed > 15 ? 0.15 : 0.08})`)
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }

      frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frameRef.current)
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }
      resizeObserver.disconnect()
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousedown", onPointerDown)
      canvas.removeEventListener("mousemove", onPointerMove)
      canvas.removeEventListener("mouseup", onPointerUp)
      canvas.removeEventListener("mouseleave", onPointerUp)
      canvas.removeEventListener("touchstart", onPointerDown)
      canvas.removeEventListener("touchmove", onPointerMove)
      canvas.removeEventListener("touchend", onPointerUp)
    }
  }, [makeNode, spawnCluster, themeColor, mode])

  return (
    <section className="panel relative" ref={containerRef}>
      <div className="fade" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="m-0 text-sm tracking-[0.18em] uppercase text-[rgba(234,240,255,0.90)]">
            Constellation Canvas
          </h3>
          <p className="m-0 mt-1 text-xs text-muted leading-relaxed">
            Drag slowly to attract • Drag fast to scatter • Click to spawn
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={cycleBackgroundTheme}
            className="btn alt text-[11px] px-3 py-2"
            title="Cycle through visual themes"
          >
            Theme: {backgroundTheme}
          </button>
          <button onClick={toggleMode} className="btn alt text-[11px] px-3 py-2">
            Mode: {mode === "calm" ? "Calm" : "Live"}
          </button>
          <button onClick={pulseSeal} className="btn alt text-[11px] px-3 py-2">
            Pulse
          </button>
          <button onClick={spawnBurst} className="btn alt text-[11px] px-3 py-2">
            Burst
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-[280px] sm:h-[360px] rounded-xl cursor-crosshair touch-none"
        style={{ background: "rgba(5, 8, 20, 0.5)" }}
      />
    </section>
  )
}

export const CanvasPlayground = memo(CanvasPlaygroundInner)
