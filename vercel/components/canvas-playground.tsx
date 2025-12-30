"use client"

import { memo, useRef, useEffect, useCallback, useImperativeHandle, forwardRef, useState } from "react"
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
  colorTheme: string
  constellationId?: number // Track which constellation this node belongs to
  phase?: number // For algorithmic movement
}

const COLOR_THEMES: Record<string, [number, number, number]> = {
  red: [255, 93, 125],
  green: [93, 255, 125],
  blue: [127, 180, 255],
  gold: [255, 215, 0],
  current: [127, 180, 255], // Will be set dynamically
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

// Performance constants
const MAX_NODES = 80
const MAX_SPARKS = 25
const MAX_TRAILS = 20
const MAX_CONSTELLATIONS = 5

export interface CanvasPlaygroundHandle {
  resetConstellation: () => void
  dropConstellation: (x?: number, y?: number) => void
}

const CanvasPlaygroundInner = forwardRef<CanvasPlaygroundHandle>((_, ref) => {
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
    pinchDistance: 0,
    pinchStart: 0,
    isPinching: false,
    touchIds: [] as number[],
  })
  const dimensionsRef = useRef({ W: 0, H: 0 })
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef(performance.now())
  const connectionFrameRef = useRef(0)
  const constellationIdRef = useRef(0)
  const [selectedColor, setSelectedColor] = useState<string>("current")

  const { mode, theme, sealPulse, burst, toggleMode, pulseSeal, spawnBurst, setTheme } = useApp()

  // Update current color theme based on app theme
  useEffect(() => {
    COLOR_THEMES.current = THEME_COLORS[theme] || THEME_COLORS.neutral
  }, [theme])

  const getColorForTheme = useCallback(
    (colorTheme: string): [number, number, number] => {
      if (colorTheme === "current") {
        return THEME_COLORS[theme] || THEME_COLORS.neutral
      }
      return COLOR_THEMES[colorTheme] || COLOR_THEMES.blue
    },
    [theme],
  )

  const makeNode = useCallback(
    (
      x: number,
      y: number,
      vx = 0,
      vy = 0,
      kind: "node" | "spark" | "trail" = "node",
      colorTheme = selectedColor,
      constellationId?: number,
    ): PlaygroundNode => {
      const baseR = kind === "trail" ? 1.5 : kind === "spark" ? 2 : 2.5
      return {
        x,
        y,
        vx: vx + (Math.random() - 0.5) * (kind === "spark" ? 1.5 : 0.4),
        vy: vy + (Math.random() - 0.5) * (kind === "spark" ? 1.5 : 0.4),
        r: baseR + Math.random() * (kind === "trail" ? 0.8 : 1.5),
        life: kind === "trail" ? 50 : kind === "spark" ? 150 + Math.random() * 100 : Number.POSITIVE_INFINITY,
        kind,
        hue: Math.random() * 40 - 20,
        age: 0,
        colorTheme,
        constellationId,
        phase: Math.random() * Math.PI * 2, // For algorithmic patterns
      }
    },
    [selectedColor],
  )

  const dropConstellation = useCallback(
    (x?: number, y?: number) => {
      const { W, H } = dimensionsRef.current
      if (W === 0 || H === 0) return

      const cx = x ?? W * 0.5
      const cy = y ?? H * 0.5
      const constellationId = constellationIdRef.current++
      const nodeCount = window.innerWidth < 768 ? 12 : 18
      const colorTheme = selectedColor

      // Create a new constellation
      for (let i = 0; i < nodeCount; i++) {
        const angle = (Math.PI * 2 * i) / nodeCount
        const radius = Math.min(W, H) * 0.12
        const spread = Math.min(W, H) * 0.06
        const nx = cx + Math.cos(angle) * (radius + (Math.random() - 0.5) * spread)
        const ny = cy + Math.sin(angle) * (radius + (Math.random() - 0.5) * spread)
        const phase = (Math.PI * 2 * i) / nodeCount
        nodesRef.current.push(makeNode(nx, ny, 0, 0, "node", colorTheme, constellationId))
      }

      // Enforce limits - remove oldest constellations if needed
      const constellations = new Set(nodesRef.current.map((n) => n.constellationId).filter((id) => id !== undefined))
      if (constellations.size > MAX_CONSTELLATIONS) {
        const sortedIds = Array.from(constellations).sort()
        const toRemove = sortedIds.slice(0, sortedIds.length - MAX_CONSTELLATIONS)
        nodesRef.current = nodesRef.current.filter((n) => !toRemove.includes(n.constellationId ?? -1))
      }
    },
    [makeNode, selectedColor],
  )

  const resetConstellation = useCallback(() => {
    const { W, H } = dimensionsRef.current
    if (W === 0 || H === 0) return

    nodesRef.current = []
    constellationIdRef.current = 0
    dropConstellation()
  }, [dropConstellation])

  useImperativeHandle(ref, () => ({
    resetConstellation,
    dropConstellation,
  }))

  const spawnCluster = useCallback(
    (x: number, y: number, count: number, vx = 0, vy = 0) => {
      const maxSparks = MAX_SPARKS
      const currentSparks = nodesRef.current.filter((n) => n.kind === "spark").length
      const availableSlots = Math.max(0, maxSparks - currentSparks)
      const spawnCount = Math.min(count, availableSlots)

      for (let i = 0; i < spawnCount; i++) {
        const angle = (Math.PI * 2 * i) / spawnCount + Math.random() * 0.4
        const dist = 8 + Math.random() * 20
        const nx = x + Math.cos(angle) * dist
        const ny = y + Math.sin(angle) * dist
        nodesRef.current.push(
          makeNode(nx, ny, vx * 0.25 + Math.cos(angle) * 0.4, vy * 0.25 + Math.sin(angle) * 0.4, "spark", selectedColor),
        )
      }

      // Enforce limits
      const nodes = nodesRef.current
      const sparks = nodes.filter((n) => n.kind === "spark")
      const trails = nodes.filter((n) => n.kind === "trail")

      if (sparks.length > MAX_SPARKS) {
        sparks.splice(MAX_SPARKS)
      }
      if (trails.length > MAX_TRAILS) {
        trails.splice(MAX_TRAILS)
      }
      if (nodes.length > MAX_NODES) {
        let toRemove = nodes.length - MAX_NODES
        for (let i = nodes.length - 1; i >= 0 && toRemove > 0; i--) {
          if (nodes[i].kind !== "node") {
            nodes.splice(i, 1)
            toRemove--
          }
        }
      }
    },
    [makeNode, selectedColor],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    const resize = () => {
      const rect = container.getBoundingClientRect()
      const isMobile = window.innerWidth < 768
      const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)

      const maxW = window.innerWidth
      const maxH = Math.min(window.innerHeight * 0.6, 600)
      const W = Math.floor(Math.min(rect.width, maxW))
      const H = Math.floor(Math.min(rect.height, maxH))

      canvas.width = Math.floor(W * DPR)
      canvas.height = Math.floor(H * DPR)
      canvas.style.width = W + "px"
      canvas.style.height = H + "px"
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

      dimensionsRef.current = { W, H }

      if (nodesRef.current.length === 0) {
        resetConstellation()
      }
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    window.addEventListener("resize", resize)

    const getCanvasCoords = (e: MouseEvent | TouchEvent, index = 0) => {
      const rect = canvas.getBoundingClientRect()
      const t = "touches" in e ? e.touches[index] || e.changedTouches[index] : null
      const clientX = t ? t.clientX : (e as MouseEvent).clientX
      const clientY = t ? t.clientY : (e as MouseEvent).clientY
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }
    }

    const getDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch2.clientX - touch1.clientX
      const dy = touch2.clientY - touch1.clientY
      return Math.sqrt(dx * dx + dy * dy)
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

      if ("touches" in e && e.touches.length === 2) {
        // Pinch gesture
        pointerRef.current.isPinching = true
        pointerRef.current.pinchDistance = getDistance(e.touches[0], e.touches[1])
        pointerRef.current.pinchStart = pointerRef.current.pinchDistance
        pointerRef.current.touchIds = [e.touches[0].identifier, e.touches[1].identifier]
      } else {
        spawnCluster(coords.x, coords.y, 6)
      }
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const coords = getCanvasCoords(e)

      if ("touches" in e && e.touches.length === 2 && pointerRef.current.isPinching) {
        // Handle pinch zoom
        const currentDistance = getDistance(e.touches[0], e.touches[1])
        const scale = currentDistance / pointerRef.current.pinchStart
        const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - canvas.getBoundingClientRect().left
        const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - canvas.getBoundingClientRect().top

        // Apply scale to nodes
        const nodes = nodesRef.current
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i]
          const dx = n.x - centerX
          const dy = n.y - centerY
          n.x = centerX + dx * scale
          n.y = centerY + dy * scale
        }

        pointerRef.current.pinchStart = currentDistance
        return
      }

      if (pointerRef.current.down) {
        const dx = coords.x - pointerRef.current.lastX
        const dy = coords.y - pointerRef.current.lastY
        const speed = Math.sqrt(dx * dx + dy * dy)

        pointerRef.current.velocity.x = pointerRef.current.velocity.x * 0.7 + dx * 0.3
        pointerRef.current.velocity.y = pointerRef.current.velocity.y * 0.7 + dy * 0.3

        pointerRef.current.trail.push({ x: coords.x, y: coords.y, age: 0 })
        if (pointerRef.current.trail.length > 30) {
          pointerRef.current.trail.shift()
        }

        if (speed > 2 && nodesRef.current.filter((n) => n.kind === "trail").length < MAX_TRAILS) {
          nodesRef.current.push(
            makeNode(
              coords.x,
              coords.y,
              pointerRef.current.velocity.x * 0.08,
              pointerRef.current.velocity.y * 0.08,
              "trail",
              selectedColor,
            ),
          )
        }

        // Enhanced force application with constellation grouping
        const nodes = nodesRef.current
        const attractionRadius = 150
        const repulsionRadius = 60

        for (let i = 0; i < nodes.length; i += 1) {
          const n = nodes[i]
          const ndx = n.x - coords.x
          const ndy = n.y - coords.y
          const distSq = ndx * ndx + ndy * ndy

          if (distSq < attractionRadius * attractionRadius && distSq > 0) {
            const dist = Math.sqrt(distSq)
            const normalizedDx = ndx / dist
            const normalizedDy = ndy / dist

            // Stronger force for nodes in the same constellation
            const sameConstellation = n.constellationId !== undefined
            const forceMultiplier = sameConstellation ? 1.3 : 1.0

            if (speed > 12 && distSq < repulsionRadius * repulsionRadius) {
              const force = (1 - dist / repulsionRadius) * 0.6 * forceMultiplier
              n.vx += normalizedDx * force * (speed * 0.04)
              n.vy += normalizedDy * force * (speed * 0.04)
            } else if (speed < 6) {
              const force = (1 - dist / attractionRadius) * 0.12 * forceMultiplier
              n.vx -= normalizedDx * force
              n.vy -= normalizedDy * force
            } else {
              const force = (1 - dist / attractionRadius) * 0.08 * forceMultiplier
              n.vx += normalizedDy * force * Math.sign(dx) * 0.5
              n.vy -= normalizedDx * force * Math.sign(dx) * 0.5
            }
          }
        }

        if (speed > 15 && Math.random() > 0.6) {
          spawnCluster(coords.x, coords.y, 2, pointerRef.current.velocity.x, pointerRef.current.velocity.y)
        }

        pointerRef.current.lastX = coords.x
        pointerRef.current.lastY = coords.y
      }

      pointerRef.current.x = coords.x
      pointerRef.current.y = coords.y
    }

    const onPointerUp = (e: MouseEvent | TouchEvent) => {
      if (pointerRef.current.down) {
        if (pointerRef.current.isPinching) {
          pointerRef.current.isPinching = false
          pointerRef.current.touchIds = []
        } else {
          const vx = pointerRef.current.velocity.x
          const vy = pointerRef.current.velocity.y
          const speed = Math.sqrt(vx * vx + vy * vy)

          if (speed > 4) {
            const coords = getCanvasCoords(e)
            spawnCluster(coords.x, coords.y, Math.min(12, Math.floor(speed * 0.8)), vx * 0.4, vy * 0.4)
          }
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
    canvas.addEventListener("touchcancel", onPointerUp)

    // Enhanced animation loop with algorithmic patterns
    const step = (t: number) => {
      const dt = Math.min(0.05, (t - lastTimeRef.current) / 1000)
      lastTimeRef.current = t

      const { W, H } = dimensionsRef.current
      if (W === 0 || H === 0) {
        frameRef.current = requestAnimationFrame(step)
        return
      }

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = "rgba(5, 8, 20, 0.3)"
      ctx.fillRect(0, 0, W, H)

      const nodes = nodesRef.current
      const isLive = mode === "live"
      const currentPulse = sealPulse
      const currentBurst = burst
      const maxDist = isLive ? 160 : 120
      const pulseBoost = 1 + currentPulse * 0.3
      const effectiveMaxDist = maxDist * pulseBoost

      // Update trail
      const trail = pointerRef.current.trail
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += dt * 60
        if (trail[i].age > 25) {
          trail.splice(i, 1)
        }
      }

      if (pointerRef.current.down && trail.length > 1) {
        ctx.beginPath()
        ctx.moveTo(trail[0].x, trail[0].y)
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y)
        }
        const [r, g, b] = getColorForTheme(selectedColor)
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.25)`
        ctx.lineWidth = 1.5
        ctx.lineCap = "round"
        ctx.stroke()
      }

      // Burst effect
      if (currentBurst > 0.5) {
        const cx = W * 0.5
        const cy = H * 0.5
        const burstCount = Math.min(10, Math.floor(currentBurst * 8))
        for (let i = 0; i < burstCount; i++) {
          const angle = (Math.PI * 2 * i) / burstCount + Math.random() * 0.2
          const speed = 1.5 + Math.random() * 2
          const nx = cx + Math.cos(angle) * 15
          const ny = cy + Math.sin(angle) * 15
          nodesRef.current.push(
            makeNode(nx, ny, Math.cos(angle) * speed, Math.sin(angle) * speed, "spark", selectedColor),
          )
        }
      }

      // Update nodes with algorithmic patterns for live mode
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i]
        n.age += dt * 60

        const friction = n.kind === "trail" ? 0.91 : 0.97
        n.vx *= friction
        n.vy *= friction

        if (n.kind === "node") {
          const driftIntensity = isLive ? 0.025 : 0.015
          n.vx += (Math.random() - 0.5) * driftIntensity
          n.vy += (Math.random() - 0.5) * driftIntensity

          // Algorithmic movement patterns in live mode
          if (isLive && n.phase !== undefined) {
            const time = t * 0.001
            const patternSpeed = 0.8
            const patternRadius = 8

            // Orbital pattern
            const orbitalX = Math.cos(n.phase + time * patternSpeed) * patternRadius
            const orbitalY = Math.sin(n.phase + time * patternSpeed) * patternRadius

            // Lissajous pattern variation
            const lissajousX = Math.cos(n.phase * 2 + time * patternSpeed * 1.3) * patternRadius * 0.6
            const lissajousY = Math.sin(n.phase * 3 + time * patternSpeed * 0.9) * patternRadius * 0.6

            // Combine patterns
            n.vx += (orbitalX + lissajousX) * 0.15
            n.vy += (orbitalY + lissajousY) * 0.15

            // Constellation cohesion - nodes in same constellation move together
            if (n.constellationId !== undefined) {
              const constellationNodes = nodes.filter(
                (other) => other.constellationId === n.constellationId && other.kind === "node",
              )
              if (constellationNodes.length > 1) {
                let centerX = 0
                let centerY = 0
                for (const other of constellationNodes) {
                  centerX += other.x
                  centerY += other.y
                }
                centerX /= constellationNodes.length
                centerY /= constellationNodes.length

                const dx = centerX - n.x
                const dy = centerY - n.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist > 0) {
                  const cohesionForce = 0.08
                  n.vx += (dx / dist) * cohesionForce
                  n.vy += (dy / dist) * cohesionForce
                }
              }
            }
          }
        }

        if (currentPulse > 0.3) {
          const dx = n.x - W * 0.5
          const dy = n.y - H * 0.5
          const distSq = dx * dx + dy * dy
          if (distSq > 0) {
            const dist = Math.sqrt(distSq)
            const pulseForce = currentPulse * 0.12
            n.vx += (dx / dist) * pulseForce * dt * 60
            n.vy += (dy / dist) * pulseForce * dt * 60
          }
        }

        n.x += n.vx
        n.y += n.vy

        const margin = 15
        if (n.x < margin) {
          n.x = margin
          n.vx *= -0.4
        } else if (n.x > W - margin) {
          n.x = W - margin
          n.vx *= -0.4
        }
        if (n.y < margin) {
          n.y = margin
          n.vy *= -0.4
        } else if (n.y > H - margin) {
          n.y = H - margin
          n.vy *= -0.4
        }

        if (n.life !== Number.POSITIVE_INFINITY) {
          n.life -= 60 * dt
          if (n.life <= 0) {
            nodes.splice(i, 1)
            continue
          }
        }

        // Simplified merging
        if (n.kind === "spark" && n.age > 50) {
          for (let j = 0; j < nodes.length; j++) {
            if (i === j || nodes[j].kind !== "node") continue
            const other = nodes[j]
            const dx = n.x - other.x
            const dy = n.y - other.y
            const distSq = dx * dx + dy * dy
            if (distSq < 144) {
              other.vx = (other.vx + n.vx * 0.25) * 0.85
              other.vy = (other.vy + n.vy * 0.25) * 0.85
              other.r = Math.min(5, other.r + 0.08)
              nodes.splice(i, 1)
              break
            }
          }
        }
      }

      // Draw connections with color themes
      connectionFrameRef.current++
      if (connectionFrameRef.current % 1 === 0) {
        ctx.lineWidth = 1
        const maxDistSq = effectiveMaxDist * effectiveMaxDist

        for (let i = 0; i < nodes.length; i += 1) {
          const a = nodes[i]
          if (a.kind === "trail") continue

          for (let j = i + 1; j < nodes.length; j += 1) {
            const b = nodes[j]
            if (b.kind === "trail") continue

            const dx = a.x - b.x
            const dy = a.y - b.y
            const distSq = dx * dx + dy * dy

            if (distSq < maxDistSq) {
              const dist = Math.sqrt(distSq)
              const t01 = 1 - dist / effectiveMaxDist
              const baseAlpha = (a.kind === "spark" || b.kind === "spark" ? 0.15 : 0.22) * pulseBoost
              const alpha = t01 * baseAlpha

              // Use node's color theme
              const [rA, gA, bA] = getColorForTheme(a.colorTheme)
              const [rB, gB, bB] = getColorForTheme(b.colorTheme)

              // Blend colors if different themes
              const rFinal = (rA + rB) * 0.5
              const gFinal = (gA + gB) * 0.5
              const bFinal = (bA + bB) * 0.5

              ctx.strokeStyle = `rgba(${rFinal}, ${gFinal}, ${bFinal}, ${alpha})`
              ctx.lineWidth = 0.8 + t01 * 0.4
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            }
          }
        }
      }

      // Draw nodes with their color themes
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        if (n.kind === "trail") {
          const alpha = Math.max(0, n.life / 50) * 0.5
          const [r, g, b] = getColorForTheme(n.colorTheme)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.r * (n.life / 50), 0, Math.PI * 2)
          ctx.fill()
          continue
        }

        let alpha = 1
        let radius = n.r

        if (n.kind === "spark") {
          alpha = Math.min(1, n.life / 120) * 0.7
        }

        const [r, g, b] = getColorForTheme(n.colorTheme)
        const hueShift = n.hue
        const rGlow = Math.min(255, Math.max(0, r + hueShift * 0.3))
        const gGlow = Math.min(255, Math.max(0, g + hueShift * 0.2))
        const bGlow = Math.min(255, Math.max(0, b + hueShift * 0.35))

        const glowRadius = radius * (2.5 + currentPulse * 1.2)
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowRadius)
        gradient.addColorStop(0, `rgba(${rGlow}, ${gGlow}, ${bGlow}, ${alpha * (0.4 + currentPulse * 0.25)})`)
        gradient.addColorStop(0.7, `rgba(${rGlow}, ${gGlow}, ${bGlow}, ${alpha * 0.15})`)
        gradient.addColorStop(1, `rgba(${rGlow}, ${gGlow}, ${bGlow}, 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        const coreR = Math.min(255, Math.max(180, 200 + hueShift * 0.4))
        const coreG = Math.min(255, Math.max(200, 220 + hueShift * 0.25))
        const coreB = Math.min(255, Math.max(220, 255 + hueShift * 0.35))
        ctx.fillStyle = `rgba(${coreR}, ${coreG}, ${coreB}, ${alpha})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, radius * (1 + currentPulse * 0.15), 0, Math.PI * 2)
        ctx.fill()
      }

      if (pointerRef.current.down) {
        const { x, y, velocity } = pointerRef.current
        const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)
        const radius = speed > 12 ? 70 : 150
        const [r, g, b] = getColorForTheme(selectedColor)

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${speed > 12 ? 0.12 : 0.06})`)
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
      resizeObserver.disconnect()
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousedown", onPointerDown)
      canvas.removeEventListener("mousemove", onPointerMove)
      canvas.removeEventListener("mouseup", onPointerUp)
      canvas.removeEventListener("mouseleave", onPointerUp)
      canvas.removeEventListener("touchstart", onPointerDown)
      canvas.removeEventListener("touchmove", onPointerMove)
      canvas.removeEventListener("touchend", onPointerUp)
      canvas.removeEventListener("touchcancel", onPointerUp)
    }
  }, [makeNode, spawnCluster, mode, sealPulse, burst, selectedColor, getColorForTheme, resetConstellation, dropConstellation])

  const colorOptions = ["red", "green", "blue", "gold", "current"]

  return (
    <section className="panel relative" ref={containerRef}>
      <div className="fade" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="m-0 text-sm tracking-[0.18em] uppercase text-[rgba(212,223,245,0.90)]">
            Constellation Canvas
          </h3>
          <p className="m-0 mt-1 text-xs text-muted leading-relaxed">
            Drag slowly to attract • Drag fast to scatter • Click to spawn • Pinch to zoom
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {/* Color selector button */}
          <button
            onClick={() => {
              const currentIndex = colorOptions.indexOf(selectedColor)
              const nextIndex = (currentIndex + 1) % colorOptions.length
              setSelectedColor(colorOptions[nextIndex])
            }}
            className="btn alt text-[11px] px-3 py-2 flex items-center gap-1.5"
            title="Change color theme"
          >
            <div className="flex gap-0.5">
              {colorOptions.map((color) => {
                const [r, g, b] = color === "current" ? getColorForTheme("current") : COLOR_THEMES[color]
                const isActive = selectedColor === color
                return (
                  <div
                    key={color}
                    className={`w-2 h-2 rounded-full transition-all ${
                      isActive ? "ring-1 ring-white/40 scale-125" : "opacity-50"
                    }`}
                    style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                  />
                )
              })}
            </div>
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
        className="w-full rounded-xl cursor-crosshair touch-none"
        style={{
          background: "rgba(5, 8, 20, 0.5)",
          height: "min(60vh, 600px)",
          maxHeight: "600px",
        }}
      />
    </section>
  )
})

CanvasPlaygroundInner.displayName = "CanvasPlayground"

export const CanvasPlayground = memo(CanvasPlaygroundInner)
