"use client"

import { memo, useRef, useEffect, useCallback, useState } from "react"
import { useApp } from "./app-provider"

interface PlaygroundNode {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  life: number
  kind: "node" | "spark" | "trail" | "constellation"
  hue: number
  age: number
  constellationId?: string
}

// Real constellation data (normalized coordinates 0-1)
interface Constellation {
  name: string
  stars: { x: number; y: number; magnitude?: number }[]
  connections: [number, number][]
}

const CONSTELLATIONS: Constellation[] = [
  {
    name: "Orion",
    stars: [
      { x: 0.45, y: 0.3, magnitude: 0.5 }, // Betelgeuse
      { x: 0.55, y: 0.7, magnitude: 0.3 }, // Rigel
      { x: 0.48, y: 0.5, magnitude: 0.8 }, // Belt star 1
      { x: 0.5, y: 0.5, magnitude: 0.8 }, // Belt star 2
      { x: 0.52, y: 0.5, magnitude: 0.8 }, // Belt star 3
      { x: 0.42, y: 0.4, magnitude: 0.7 }, // Shoulder
      { x: 0.58, y: 0.4, magnitude: 0.7 }, // Shoulder
    ],
    connections: [[0, 5], [5, 2], [2, 3], [3, 4], [4, 6], [6, 1], [2, 1]],
  },
  {
    name: "Ursa Major",
    stars: [
      { x: 0.3, y: 0.4, magnitude: 0.6 },
      { x: 0.35, y: 0.35, magnitude: 0.6 },
      { x: 0.4, y: 0.35, magnitude: 0.6 },
      { x: 0.45, y: 0.4, magnitude: 0.6 },
      { x: 0.42, y: 0.5, magnitude: 0.5 },
      { x: 0.35, y: 0.5, magnitude: 0.5 },
      { x: 0.32, y: 0.55, magnitude: 0.5 },
    ],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0]],
  },
  {
    name: "Cassiopeia",
    stars: [
      { x: 0.4, y: 0.3, magnitude: 0.6 },
      { x: 0.45, y: 0.25, magnitude: 0.6 },
      { x: 0.5, y: 0.3, magnitude: 0.7 },
      { x: 0.55, y: 0.25, magnitude: 0.6 },
      { x: 0.6, y: 0.3, magnitude: 0.6 },
    ],
    connections: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    name: "Cygnus",
    stars: [
      { x: 0.5, y: 0.2, magnitude: 0.5 }, // Deneb
      { x: 0.5, y: 0.5, magnitude: 0.6 }, // Center
      { x: 0.4, y: 0.55, magnitude: 0.7 }, // Wing
      { x: 0.6, y: 0.55, magnitude: 0.7 }, // Wing
      { x: 0.5, y: 0.7, magnitude: 0.6 }, // Tail
    ],
    connections: [[0, 1], [1, 2], [1, 3], [1, 4]],
  },
]

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
  const dimensionsRef = useRef({ W: 0, H: 0 })
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef(performance.now())
  const isVisibleRef = useRef(true)

  // Interactivity state
  const [rotation3D, setRotation3D] = useState({ x: 0, y: 0 })
  const [currentConstellation, setCurrentConstellation] = useState(0)
  const rotationStartRef = useRef({ x: 0, y: 0, active: false })

  // Refs for values used in animation loop to avoid effect re-runs
  const rotation3DRef = useRef(rotation3D)

  // Touch gesture state
  const touchStateRef = useRef({
    initialDistance: 0,
    initialAngle: 0,
    isTwoFinger: false,
  })

  const { mode, theme, toggleMode, pulseSeal, spawnBurst, cycleBackgroundTheme, backgroundTheme } = useApp()
  const themeColor = THEME_COLORS[theme] || THEME_COLORS.neutral

  // Spawn constellation at center with button
  const handleSpawnConstellation = () => {
    const { W, H } = dimensionsRef.current
    if (W && H) {
      spawnConstellation(currentConstellation, W / 2, H / 2, 150)
      setCurrentConstellation((prev) => (prev + 1) % CONSTELLATIONS.length)
    }
  }

  // Sync refs with state to avoid effect re-runs
  useEffect(() => {
    rotation3DRef.current = rotation3D
  }, [rotation3D])

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
      // Reduce particle count on mobile for performance
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const adjustedCount = isMobile ? Math.floor(count * 0.6) : count

      for (let i = 0; i < adjustedCount; i++) {
        const angle = (Math.PI * 2 * i) / adjustedCount + Math.random() * 0.5
        const dist = 10 + Math.random() * 30
        const nx = x + Math.cos(angle) * dist
        const ny = y + Math.sin(angle) * dist
        nodesRef.current.push(
          makeNode(nx, ny, vx * 0.3 + Math.cos(angle) * 0.5, vy * 0.3 + Math.sin(angle) * 0.5, "spark"),
        )
      }
      // Cap nodes - lower limit on mobile
      const maxNodes = isMobile ? 150 : 300
      if (nodesRef.current.length > maxNodes) {
        nodesRef.current.splice(0, nodesRef.current.length - maxNodes)
      }
    },
    [makeNode],
  )

  const spawnConstellation = useCallback(
    (constellationIndex: number, centerX: number, centerY: number, scale = 100) => {
      const constellation = CONSTELLATIONS[constellationIndex]
      const constellationId = `${constellation.name}-${Date.now()}`

      constellation.stars.forEach((star) => {
        const x = centerX + (star.x - 0.5) * scale
        const y = centerY + (star.y - 0.5) * scale
        const magnitude = star.magnitude || 0.5
        const node = makeNode(x, y, 0, 0, "node")
        node.kind = "constellation"
        node.constellationId = constellationId
        node.r = 2 + magnitude * 2
        nodesRef.current.push(node)
      })
    },
    [makeNode],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    // Enable hardware acceleration and optimize for mobile
    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true, // Reduces input latency on mobile
      willReadFrequently: false,
    })
    if (!ctx) return

    const resize = () => {
      const rect = container.getBoundingClientRect()

      // Optimize DPR for performance on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
      const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)

      const W = Math.floor(rect.width)
      const H = Math.floor(rect.height)

      canvas.width = Math.floor(W * DPR)
      canvas.height = Math.floor(H * DPR)
      canvas.style.width = W + "px"
      canvas.style.height = H + "px"
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

      dimensionsRef.current = { W, H }

      // Seed initial constellation with fewer nodes on mobile
      if (nodesRef.current.length === 0) {
        const nodeCount = isMobile ? 15 : 25
        for (let i = 0; i < nodeCount; i++) {
          nodesRef.current.push(makeNode(Math.random() * W, Math.random() * H, 0, 0, "node"))
        }
      }
    }

    resize()
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
      if (touchStateRef.current.isTwoFinger) return // Don't interfere with gestures

      const coords = getCanvasCoords(e)
      pointerRef.current.down = true
      pointerRef.current.x = coords.x
      pointerRef.current.y = coords.y
      pointerRef.current.lastX = coords.x
      pointerRef.current.lastY = coords.y
      pointerRef.current.velocity = { x: 0, y: 0 }
      pointerRef.current.trail = []

      // Spawn burst on click
      spawnCluster(coords.x, coords.y, 8)
    }

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      const coords = getCanvasCoords(e)
      rotationStartRef.current = { x: coords.x, y: coords.y, active: true }
    }

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (touchStateRef.current.isTwoFinger) return // Don't interfere with gestures

      const coords = getCanvasCoords(e)

      // Handle right-click 3D rotation
      if (rotationStartRef.current.active && e instanceof MouseEvent && e.buttons === 2) {
        const dx = coords.x - rotationStartRef.current.x
        const dy = coords.y - rotationStartRef.current.y
        setRotation3D((prev) => ({
          x: prev.x + dy * 0.005,
          y: prev.y + dx * 0.005,
        }))
        rotationStartRef.current = { x: coords.x, y: coords.y, active: true }
        return
      }

      if (pointerRef.current.down) {
        const dx = coords.x - pointerRef.current.lastX
        const dy = coords.y - pointerRef.current.lastY
        const speed = Math.sqrt(dx * dx + dy * dy)

        // Track speed for research mode discovery
        lastSpeedRef.current = speed

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
      rotationStartRef.current.active = false
    }

    // Touch handlers for mobile gestures
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Two fingers = rotation gesture
        touchStateRef.current.isTwoFinger = true
        const rect = canvas.getBoundingClientRect()
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dx = t2.clientX - t1.clientX
        const dy = t2.clientY - t1.clientY
        touchStateRef.current.initialAngle = Math.atan2(dy, dx)
        pointerRef.current.down = false // Cancel any drag
      } else if (e.touches.length === 1) {
        // Single touch = normal interaction
        touchStateRef.current.isTwoFinger = false
        onPointerDown(e)
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStateRef.current.isTwoFinger) {
        // Two-finger rotation
        const t1 = e.touches[0]
        const t2 = e.touches[1]
        const dx = t2.clientX - t1.clientX
        const dy = t2.clientY - t1.clientY
        const currentAngle = Math.atan2(dy, dx)
        const angleDelta = currentAngle - touchStateRef.current.initialAngle

        setRotation3D((prev) => ({
          x: prev.x + Math.sin(angleDelta) * 0.3,
          y: prev.y + Math.cos(angleDelta) * 0.3,
        }))

        touchStateRef.current.initialAngle = currentAngle
      } else if (e.touches.length === 1 && !touchStateRef.current.isTwoFinger) {
        // Single touch drag
        onPointerMove(e)
      }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchStateRef.current.isTwoFinger = false
      }
      if (e.touches.length === 0) {
        onPointerUp(e)
      }
    }

    canvas.addEventListener("mousedown", onPointerDown)
    canvas.addEventListener("mousemove", onPointerMove)
    canvas.addEventListener("mouseup", onPointerUp)
    canvas.addEventListener("mouseleave", onPointerUp)
    canvas.addEventListener("contextmenu", onContextMenu)
    canvas.addEventListener("touchstart", onTouchStart, { passive: true })
    canvas.addEventListener("touchmove", onTouchMove, { passive: true })
    canvas.addEventListener("touchend", onTouchEnd)
    canvas.addEventListener("touchcancel", onTouchEnd)

    // Visibility API for performance
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
      if (isVisibleRef.current) {
        lastTimeRef.current = performance.now()
        if (frameRef.current === 0) {
          frameRef.current = requestAnimationFrame(step)
        }
      } else {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = 0
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Animation loop
    const step = (t: number) => {
      if (!isVisibleRef.current) {
        frameRef.current = 0
        return
      }

      const dt = Math.min(0.05, (t - lastTimeRef.current) / 1000)
      lastTimeRef.current = t

      const { W, H } = dimensionsRef.current
      ctx.clearRect(0, 0, W, H)

      // Background
      ctx.fillStyle = "rgba(5, 8, 20, 0.3)"
      ctx.fillRect(0, 0, W, H)

      // Apply simple 3D rotation transform
      ctx.save()
      ctx.translate(W / 2, H / 2)

      // Use CSS-like 3D transforms (rotateX and rotateY)
      const perspective = 1000
      const scaleX = Math.cos(rotation3DRef.current.y)
      const scaleY = Math.cos(rotation3DRef.current.x)
      const skewX = Math.sin(rotation3DRef.current.y) * 0.5
      const skewY = Math.sin(rotation3DRef.current.x) * 0.5

      ctx.transform(scaleX, skewY, skewX, scaleY, 0, 0)
      ctx.translate(-W / 2, -H / 2)

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

      // Draw constellation connections first
      const constellationNodes = new Map<string, PlaygroundNode[]>()
      nodes.forEach((node) => {
        if (node.kind === "constellation" && node.constellationId) {
          if (!constellationNodes.has(node.constellationId)) {
            constellationNodes.set(node.constellationId, [])
          }
          constellationNodes.get(node.constellationId)!.push(node)
        }
      })

      constellationNodes.forEach((constNodes, constellationId) => {
        const constellationName = constellationId.split("-")[0]
        const constellation = CONSTELLATIONS.find((c) => c.name === constellationName)
        if (!constellation) return

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.6)`
        ctx.lineWidth = 2

        constellation.connections.forEach(([startIdx, endIdx]) => {
          if (startIdx < constNodes.length && endIdx < constNodes.length) {
            const start = constNodes[startIdx]
            const end = constNodes[endIdx]
            ctx.beginPath()
            ctx.moveTo(start.x, start.y)
            ctx.lineTo(end.x, end.y)
            ctx.stroke()
          }
        })
      })

      // Draw connections with glow effect
      let linkCount = 0
      ctx.lineWidth = 1

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        if (a.kind === "trail" || a.kind === "constellation") continue

        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          if (b.kind === "trail" || b.kind === "constellation") continue

          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (a.kind === "spark" || b.kind === "spark" ? 0.15 : 0.25)
            ctx.strokeStyle = `rgba(${r + a.hue}, ${g}, ${b + b.hue}, ${alpha})`
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

      // Restore canvas state after 3D transforms
      ctx.restore()

      frameRef.current = requestAnimationFrame(step)
    }

    frameRef.current = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      canvas.removeEventListener("mousedown", onPointerDown)
      canvas.removeEventListener("mousemove", onPointerMove)
      canvas.removeEventListener("mouseup", onPointerUp)
      canvas.removeEventListener("mouseleave", onPointerUp)
      canvas.removeEventListener("contextmenu", onContextMenu)
      canvas.removeEventListener("touchstart", onTouchStart)
      canvas.removeEventListener("touchmove", onTouchMove)
      canvas.removeEventListener("touchend", onTouchEnd)
      canvas.removeEventListener("touchcancel", onTouchEnd)
    }
  }, [makeNode, spawnCluster, spawnConstellation, themeColor, mode])

  return (
    <section className="panel relative" ref={containerRef}>
      <div className="fade" />
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="m-0 text-sm tracking-[0.18em] uppercase text-[rgba(234,240,255,0.90)]">
            Constellation Canvas
          </h3>
          <p className="m-0 mt-1 text-xs text-muted leading-relaxed">
            <span className="hidden sm:inline">Drag slowly to attract • Drag fast to scatter • Right-click + drag to rotate 3D</span>
            <span className="sm:hidden">Tap to spawn • Drag to attract • 2 fingers to rotate 3D</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleSpawnConstellation} className="btn text-[11px] px-3 py-2">
            {CONSTELLATIONS[currentConstellation].name} ✦
          </button>
          <button
            onClick={cycleBackgroundTheme}
            className="btn alt text-[11px] px-3 py-2"
            title="Cycle through visual themes (Neural/Wireframe/Circuit)"
          >
            Theme: {backgroundTheme === "neural" ? "Neural" : backgroundTheme === "wireframe" ? "Wireframe" : "Circuit"}
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
        style={{
          background: "rgba(5, 8, 20, 0.5)",
          willChange: "transform",
          transform: "translateZ(0)",
          maxWidth: "100%",
          maxHeight: "100vh",
          objectFit: "contain",
        }}
      />
    </section>
  )
}

export const CanvasPlayground = memo(CanvasPlaygroundInner)
