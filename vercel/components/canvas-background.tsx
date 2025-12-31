"use client"

import { useEffect, useRef, useCallback, useMemo, memo } from "react"
import { useApp } from "./app-provider"

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  life: number
  kind: "node" | "spark"
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

const TRI_COLORS = ["rgba(255,93,125", "rgba(255,181,90", "rgba(127,180,255"]

const MAX_NODES = 180
const BURST_COUNT = 18
const SPARK_COUNT = 10
const POINTER_THROTTLE_MS = 16
const DAMPING = 0.985
const POINTER_DAMPING = 0.86

function CanvasBackgroundInner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const pointerRef = useRef({ x: 0.5, y: 0.5, dx: 0, dy: 0, down: false, lastX: 0, lastY: 0 })
  const stateRef = useRef({ scroll: 0, lastT: performance.now() })
  const dimensionsRef = useRef({ W: 0, H: 0, DPR: 1 })
  const frameRef = useRef<number>(0)
  const isVisibleRef = useRef(true)
  const isInViewportRef = useRef(false) // Zone A viewport tracking

  const {
    mode,
    theme,
    sealPulse,
    burst,
    updateStats,
    setSealPulse,
    setBurst,
    spawnBurst: triggerBurst,
    toggleMode,
    pulseSeal: triggerPulseSeal,
  } = useApp()

  const themeColor = useMemo(() => THEME_COLORS[theme] || THEME_COLORS.neutral, [theme])

  const makeNode = useCallback((x?: number, y?: number, isSpark = false): Node => {
    const { W, H } = dimensionsRef.current
    const speed = isSpark ? 0.9 : 0.35
    return {
      x: x ?? Math.random() * W,
      y: y ?? Math.random() * H,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed,
      r: (isSpark ? 0.9 : 1.1) + Math.random() * (isSpark ? 1.2 : 1.8),
      life: isSpark ? 220 + Math.random() * 240 : Number.POSITIVE_INFINITY,
      kind: isSpark ? "spark" : "node",
    }
  }, [])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const isMobile = window.innerWidth < 768
    const DPR = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
    const W = Math.floor(window.innerWidth)
    const H = Math.floor(window.innerHeight)

    canvas.width = Math.floor(W * DPR)
    canvas.height = Math.floor(H * DPR)
    canvas.style.width = W + "px"
    canvas.style.height = H + "px"

    const ctx = canvas.getContext("2d", { alpha: true })
    if (ctx) {
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }

    dimensionsRef.current = { W, H, DPR }

    const baseCount = Math.floor((W * H) / (isMobile ? 28000 : 22000))
    const nodeCount = Math.max(24, Math.min(isMobile ? 60 : 100, baseCount))
    nodesRef.current = Array.from({ length: nodeCount }, () => makeNode())
  }, [makeNode])

  useEffect(() => {
    if (burst > 0.8) {
      const { W, H } = dimensionsRef.current
      const cx = W * 0.5
      const cy = H * 0.32
      for (let i = 0; i < BURST_COUNT; i++) {
        nodesRef.current.push(makeNode(cx + (Math.random() - 0.5) * 240, cy + (Math.random() - 0.5) * 220, true))
      }
      if (nodesRef.current.length > MAX_NODES) {
        nodesRef.current.splice(0, nodesRef.current.length - MAX_NODES)
      }
    }
  }, [burst, makeNode])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    resize()

    let pointerMoveThrottle = 0
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const now = performance.now()
      if (now - pointerMoveThrottle < POINTER_THROTTLE_MS) return
      pointerMoveThrottle = now

      const { W, H } = dimensionsRef.current
      const t = "touches" in e ? e.touches[0] : null
      const clientX = t ? t.clientX : (e as MouseEvent).clientX
      const clientY = t ? t.clientY : (e as MouseEvent).clientY

      const x = clientX / W
      const y = clientY / H

      pointerRef.current.dx += (x - pointerRef.current.x) * 0.1
      pointerRef.current.dy += (y - pointerRef.current.y) * 0.1

      if (pointerRef.current.down) {
        const dx = clientX - pointerRef.current.lastX
        const dy = clientY - pointerRef.current.lastY
        const nodes = nodesRef.current
        const len = nodes.length
        for (let i = 0; i < len; i++) {
          const n = nodes[i]
          const distX = n.x - clientX
          const distY = n.y - clientY
          const distSq = distX * distX + distY * distY
          if (distSq < 48400) {
            // 220^2
            n.vx += dx * 0.0007
            n.vy += dy * 0.0007
          }
        }
        pointerRef.current.lastX = clientX
        pointerRef.current.lastY = clientY
      }
    }

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const t = "touches" in e ? e.touches[0] : null
      const x = t ? t.clientX : (e as MouseEvent).clientX
      const y = t ? t.clientY : (e as MouseEvent).clientY
      pointerRef.current.down = true
      pointerRef.current.lastX = x
      pointerRef.current.lastY = y

      for (let i = 0; i < SPARK_COUNT; i++) {
        nodesRef.current.push(makeNode(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 30, true))
      }
      if (nodesRef.current.length > MAX_NODES) {
        nodesRef.current.splice(0, nodesRef.current.length - MAX_NODES)
      }
    }

    const onPointerUp = () => {
      pointerRef.current.down = false
    }

    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      stateRef.current.scroll = window.scrollY / maxScroll
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const k = e.key.toLowerCase()
      if (k === "m") toggleMode()
      if (k === "s") triggerPulseSeal()
      if (k === "b") triggerBurst()
    }

    // Zone A Runtime Governance: Viewport-based suspension
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewportRef.current = entry.isIntersecting
        if (entry.isIntersecting && isVisibleRef.current) {
          // Resume: Zone A entering viewport
          stateRef.current.lastT = performance.now()
          if (frameRef.current === 0) {
            frameRef.current = requestAnimationFrame(step)
          }
        } else {
          // Suspend: Zone A leaving viewport
          cancelAnimationFrame(frameRef.current)
          frameRef.current = 0
        }
      },
      { threshold: 0.1 } // Activate when 10% visible
    )
    observer.observe(canvas)

    const onVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible"
      if (isVisibleRef.current && isInViewportRef.current) {
        // Resume if both visible AND in viewport
        stateRef.current.lastT = performance.now()
        if (frameRef.current === 0) {
          frameRef.current = requestAnimationFrame(step)
        }
      } else {
        // Suspend if hidden OR out of viewport
        cancelAnimationFrame(frameRef.current)
        frameRef.current = 0
      }
    }

    window.addEventListener("resize", resize)
    window.addEventListener("mousemove", onPointerMove, { passive: true })
    window.addEventListener("touchmove", onPointerMove, { passive: true })
    window.addEventListener("mousedown", onPointerDown, { passive: true })
    window.addEventListener("touchstart", onPointerDown, { passive: true })
    window.addEventListener("mouseup", onPointerUp, { passive: true })
    window.addEventListener("touchend", onPointerUp, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("keydown", onKeyDown)
    document.addEventListener("visibilitychange", onVisibilityChange)

    // Store refs for animation loop
    const modeRef = { current: mode }
    const sealPulseRef = { current: sealPulse }
    const themeColorRef = { current: themeColor }

    // Animation loop - Zone A HP-Cinematic engine
    const step = (t: number) => {
      // Runtime governance: Only render when visible AND in viewport
      if (!isVisibleRef.current || !isInViewportRef.current) {
        frameRef.current = 0
        return
      }

      const { W, H } = dimensionsRef.current
      const dt = Math.min(0.05, (t - stateRef.current.lastT) / 1000)
      stateRef.current.lastT = t

      pointerRef.current.x += pointerRef.current.dx
      pointerRef.current.y += pointerRef.current.dy
      pointerRef.current.dx *= POINTER_DAMPING
      pointerRef.current.dy *= POINTER_DAMPING

      ctx.clearRect(0, 0, W, H)

      const scroll = stateRef.current.scroll
      const depth = 0.18 + scroll * 0.22

      const vg = ctx.createRadialGradient(W * 0.45, H * 0.22, 40, W * 0.5, H * 0.52, Math.max(W, H) * 0.85)
      vg.addColorStop(0, `rgba(127,180,255,${0.1 + depth * 0.06})`)
      vg.addColorStop(0.45, `rgba(20,30,70,${0.03 + depth * 0.04})`)
      vg.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, W, H)

      const currentMode = modeRef.current
      const intensity = currentMode === "live" ? 1.45 : 1.0
      const px = (pointerRef.current.x - 0.5) * 12 * intensity
      const py = (pointerRef.current.y - 0.5) * 12 * intensity

      const nodes = nodesRef.current
      const jitter = currentMode === "live" ? 0.1 : 0.06
      const scrollFactor = 1 + scroll * 0.2

      // Update nodes - iterate backwards for safe removal
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i]
        n.vx += (Math.random() - 0.5) * jitter * dt
        n.vy += (Math.random() - 0.5) * jitter * dt
        n.vx *= DAMPING
        n.vy *= DAMPING
        n.x += (n.vx + px * 0.003) * scrollFactor
        n.y += (n.vy + py * 0.003) * scrollFactor

        if (n.x < -30) n.x = W + 30
        else if (n.x > W + 30) n.x = -30
        if (n.y < -30) n.y = H + 30
        else if (n.y > H + 30) n.y = -30

        if (n.life !== Number.POSITIVE_INFINITY) {
          n.life -= 60 * dt
          if (n.life <= 0) {
            nodes.splice(i, 1)
          }
        }
      }

      const maxDist = Math.min(230, Math.max(130, W * 0.18))
      const maxDistSq = maxDist * maxDist
      const [r, g, b] = themeColorRef.current
      const currentPulse = sealPulseRef.current
      const linkBoost = (currentMode === "live" ? 1.2 : 1.0) + currentPulse * 0.8

      let linkCount = 0
      const nodeLen = nodes.length

      // Draw all nodes first
      ctx.beginPath()
      for (let i = 0; i < nodeLen; i++) {
        const a = nodes[i]
        ctx.moveTo(a.x + a.r, a.y)
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
      }
      ctx.fillStyle = "rgba(200,220,255,0.16)"
      ctx.fill()

      // Draw sparks with higher alpha
      ctx.beginPath()
      for (let i = 0; i < nodeLen; i++) {
        const a = nodes[i]
        if (a.kind === "spark") {
          ctx.moveTo(a.x + a.r, a.y)
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
        }
      }
      ctx.fillStyle = "rgba(200,220,255,0.22)"
      ctx.fill()

      // Draw connections with spatial partitioning optimization
      ctx.lineWidth = 1
      for (let i = 0; i < nodeLen; i++) {
        const a = nodes[i]
        for (let j = i + 1; j < nodeLen; j++) {
          const bN = nodes[j]
          const dx = a.x - bN.x
          const dy = a.y - bN.y
          const distSq = dx * dx + dy * dy
          if (distSq > maxDistSq) continue

          const d = Math.sqrt(distSq)
          const t01 = 1 - d / maxDist
          const aCol = 0.07 * t01 * linkBoost
          ctx.strokeStyle = `rgba(${r},${g},${b},${aCol})`
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(bN.x, bN.y)
          ctx.stroke()
          linkCount++
        }
      }

      // Central seal
      const cx = W * 0.5 + px * 2.6
      const cy = H * (0.28 + scroll * 0.08) + py * 2.2

      const ringA = 0.1 + currentPulse * 0.12
      ctx.strokeStyle = `rgba(255,255,255,${ringA})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(cx, cy, 150 + currentPulse * 20, 76 + currentPulse * 10, 0.22, 0, Math.PI * 2)
      ctx.stroke()

      // Tri-spiral arcs
      const triA = 0.08 + currentPulse * 0.16
      const rad = 26 + currentPulse * 8
      const rotSpeed = t * 0.00035 * (currentMode === "live" ? 1.2 : 0.7)
      ctx.lineWidth = 2
      for (let k = 0; k < 3; k++) {
        const ang = ((Math.PI * 2) / 3) * k + rotSpeed
        const ox = Math.cos(ang) * (38 + currentPulse * 10)
        const oy = Math.sin(ang) * (22 + currentPulse * 6)
        ctx.strokeStyle = `${TRI_COLORS[k]},${triA})`
        ctx.beginPath()
        ctx.arc(cx + ox, cy + oy, rad, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Lattice frame
      const frameA = 0.06 + scroll * 0.1
      ctx.strokeStyle = `rgba(127,180,255,${frameA})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(26, 24)
      ctx.lineTo(W - 26, 24)
      ctx.lineTo(W - 26, H - 24)
      ctx.lineTo(26, H - 24)
      ctx.closePath()
      ctx.stroke()

      ctx.fillStyle = "rgba(255,255,255,0.03)"
      for (let k = 0; k < 4; k++) {
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1)
      }

      updateStats(nodeLen, linkCount)
      frameRef.current = requestAnimationFrame(step)
    }

    // Sync refs with props at lower frequency
    const syncInterval = setInterval(() => {
      modeRef.current = mode
      sealPulseRef.current = sealPulse
      themeColorRef.current = themeColor

      if (sealPulse > 0) {
        setSealPulse(Math.max(0, sealPulse - 0.012))
      }
      if (burst > 0) {
        setBurst(Math.max(0, burst - 0.007))
      }
    }, 16)

    frameRef.current = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frameRef.current)
      observer.disconnect()
      clearInterval(syncInterval)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onPointerMove)
      window.removeEventListener("touchmove", onPointerMove)
      window.removeEventListener("mousedown", onPointerDown)
      window.removeEventListener("touchstart", onPointerDown)
      window.removeEventListener("mouseup", onPointerUp)
      window.removeEventListener("touchend", onPointerUp)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [
    mode,
    theme,
    themeColor,
    sealPulse,
    burst,
    makeNode,
    resize,
    updateStats,
    setSealPulse,
    setBurst,
    toggleMode,
    triggerPulseSeal,
    triggerBurst,
  ])

  return <canvas ref={canvasRef} id="bg" className="fixed inset-0 w-full h-full block z-0 bg-transparent touch-none" />
}

export const CanvasBackground = memo(CanvasBackgroundInner)
