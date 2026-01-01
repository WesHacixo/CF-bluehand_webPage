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

interface GridPlane {
  z: number
  rotation: number
  opacity: number
  speed: number
}

interface CircuitTrace {
  points: { x: number; y: number }[]
  progress: number
  speed: number
  hue: number
}

function CanvasBackgroundInner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<Node[]>([])
  const pointerRef = useRef({ x: 0.5, y: 0.5, dx: 0, dy: 0, down: false, lastX: 0, lastY: 0 })
  const stateRef = useRef({ scroll: 0, lastT: performance.now() })
  const dimensionsRef = useRef({ W: 0, H: 0, DPR: 1 })
  const frameRef = useRef<number>(0)
  const isVisibleRef = useRef(true)
  const gridPlanesRef = useRef<GridPlane[]>([])
  const circuitTracesRef = useRef<CircuitTrace[]>([])

  const {
    mode,
    theme,
    backgroundTheme,
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

  const initGridPlanes = useCallback(() => {
    gridPlanesRef.current = Array.from({ length: 6 }, (_, i) => ({
      z: i * 150 - 300,
      rotation: Math.random() * Math.PI * 2,
      opacity: 0.15 + Math.random() * 0.2,
      speed: 0.3 + Math.random() * 0.2,
    }))
  }, [])

  const initCircuitTraces = useCallback(() => {
    const { W, H } = dimensionsRef.current
    circuitTracesRef.current = Array.from({ length: 20 }, () => {
      const startX = Math.random() < 0.5 ? 0 : W
      const startY = Math.random() * H
      const points: { x: number; y: number }[] = [{ x: startX, y: startY }]

      let x = startX
      let y = startY
      const segments = 5 + Math.floor(Math.random() * 8)

      for (let i = 0; i < segments; i++) {
        const dx = (Math.random() - 0.5) * 100
        const dy = (Math.random() - 0.5) * 100
        x += dx
        y += dy
        points.push({ x, y })
      }

      return {
        points,
        progress: Math.random(),
        speed: 0.1 + Math.random() * 0.2,
        hue: Math.random() * 60 - 30,
      }
    })
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

    initGridPlanes()
    initCircuitTraces()
  }, [makeNode, initGridPlanes, initCircuitTraces])

  const drawWireframeTheme = useCallback(
    (ctx: CanvasRenderingContext2D, t: number, W: number, H: number, scroll: number, pulse: number) => {
      const planes = gridPlanesRef.current
      const [r, g, b] = themeColor

      planes.forEach((plane) => {
        plane.z += plane.speed
        if (plane.z > 300) plane.z = -300

        const scale = 1 + (plane.z + 300) / 600
        const alpha = plane.opacity * (1 - Math.abs(plane.z) / 400) * (0.8 + pulse * 0.4)

        ctx.save()
        ctx.translate(W / 2, H / 2 + scroll * 100)
        ctx.scale(scale, scale)
        ctx.rotate(plane.rotation + t * 0.0001)

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.lineWidth = 1

        const gridSize = 40
        const gridCount = 12
        for (let i = -gridCount; i <= gridCount; i++) {
          ctx.beginPath()
          ctx.moveTo(i * gridSize, -gridCount * gridSize)
          ctx.lineTo(i * gridSize, gridCount * gridSize)
          ctx.stroke()

          ctx.beginPath()
          ctx.moveTo(-gridCount * gridSize, i * gridSize)
          ctx.lineTo(gridCount * gridSize, i * gridSize)
          ctx.stroke()
        }

        ctx.restore()
      })

      const centerX = W / 2
      const centerY = H / 2
      const rings = 8
      for (let i = 0; i < rings; i++) {
        const radius = 50 + i * 30 + pulse * 40
        const alpha = (1 - i / rings) * 0.12
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.stroke()
      }
    },
    [themeColor],
  )

  const drawCircuitTheme = useCallback(
    (ctx: CanvasRenderingContext2D, t: number, W: number, H: number, scroll: number, pulse: number) => {
      const [r, g, b] = themeColor
      const traces = circuitTracesRef.current

      traces.forEach((trace) => {
        trace.progress += trace.speed * 0.01
        if (trace.progress > 1) trace.progress = 0

        const visiblePoints = Math.floor(trace.points.length * trace.progress)

        ctx.strokeStyle = `rgba(${r + trace.hue}, ${g}, ${b}, 0.3)`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        if (visiblePoints > 0) {
          ctx.moveTo(trace.points[0].x, trace.points[0].y)
          for (let i = 1; i < visiblePoints; i++) {
            ctx.lineTo(trace.points[i].x, trace.points[i].y)
          }
          ctx.stroke()
        }

        if (visiblePoints > 0 && visiblePoints < trace.points.length) {
          const point = trace.points[visiblePoints]
          const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 8)
          gradient.addColorStop(0, `rgba(${r + trace.hue}, ${g + 20}, ${b + 20}, 0.8)`)
          gradient.addColorStop(1, `rgba(${r + trace.hue}, ${g}, ${b}, 0)`)
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(point.x, point.y, 8, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      const cx = W / 2
      const cy = H / 2.5 + scroll * 80
      const handScale = 1 + pulse * 0.15

      ctx.save()
      ctx.translate(cx, cy)
      ctx.scale(handScale, handScale)

      ctx.strokeStyle = `rgba(${r}, ${g + 20}, ${b + 40}, ${0.4 + pulse * 0.3})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, -60)
      ctx.lineTo(30, -50)
      ctx.lineTo(35, -20)
      ctx.lineTo(30, 40)
      ctx.lineTo(0, 50)
      ctx.lineTo(-30, 40)
      ctx.lineTo(-35, -20)
      ctx.lineTo(-30, -50)
      ctx.closePath()
      ctx.stroke()

      const geomRadius = 12
      const geomAlpha = 0.5 + pulse * 0.4
      ctx.strokeStyle = `rgba(${255 - r * 0.3}, ${100}, ${125}, ${geomAlpha})`
      ctx.lineWidth = 1.5
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3
        const ox = Math.cos(angle) * geomRadius
        const oy = Math.sin(angle) * geomRadius
        ctx.beginPath()
        ctx.arc(ox, oy, geomRadius, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.beginPath()
      ctx.arc(0, 0, geomRadius, 0, Math.PI * 2)
      ctx.stroke()

      ctx.restore()
    },
    [themeColor],
  )

  const drawCosmicTheme = useCallback(
    (ctx: CanvasRenderingContext2D, t: number, W: number, H: number, scroll: number, pulse: number) => {
      const [r, g, b] = themeColor
      const cx = W / 2
      const cy = H / 2.5 + scroll * 80

      // Triskelion spirals
      for (let arm = 0; arm < 3; arm++) {
        const armAngle = (arm * Math.PI * 2) / 3 + t * 0.0002
        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(armAngle)

        ctx.strokeStyle = `rgba(${255}, ${93 + arm * 30}, ${125 + arm * 40}, ${0.3 + pulse * 0.2})`
        ctx.lineWidth = 2
        ctx.beginPath()
        for (let i = 0; i < 60; i++) {
          const angle = i * 0.1
          const radius = i * 3 + pulse * 20
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.restore()
      }

      // Central triskelion symbol
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(t * 0.0003)
      for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3
        const dist = 40 + pulse * 15
        ctx.strokeStyle = `rgba(${r}, ${g + 40}, ${b}, ${0.6 + pulse * 0.3})`
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 20, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()

      // Cosmic particles
      for (let i = 0; i < 30; i++) {
        const particleAngle = (i / 30) * Math.PI * 2 + t * 0.0005
        const particleRadius = 150 + Math.sin(t * 0.001 + i) * 50
        const px = cx + Math.cos(particleAngle) * particleRadius
        const py = cy + Math.sin(particleAngle) * particleRadius
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.2 + pulse * 0.3})`
        ctx.beginPath()
        ctx.arc(px, py, 2, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    [themeColor],
  )

  const drawGeometricTheme = useCallback(
    (ctx: CanvasRenderingContext2D, t: number, W: number, H: number, scroll: number, pulse: number) => {
      const [r, g, b] = themeColor

      // Floating polyhedrons
      for (let i = 0; i < 8; i++) {
        const x = (W / 9) * (i + 1) + Math.sin(t * 0.0003 + i) * 50
        const y = H / 2.5 + Math.cos(t * 0.0002 + i) * 100 + scroll * 60
        const size = 40 + Math.sin(t * 0.0004 + i) * 15
        const rotation = t * 0.0005 + i

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rotation)

        // Icosahedron wireframe
        ctx.strokeStyle = `rgba(${r}, ${g + 20}, ${b + 30}, ${0.25 + pulse * 0.2})`
        ctx.lineWidth = 1.5

        for (let face = 0; face < 5; face++) {
          const angle = (face * Math.PI * 2) / 5
          ctx.beginPath()
          ctx.moveTo(0, -size)
          ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size)
          ctx.lineTo(Math.cos(angle + Math.PI * 0.4) * size, Math.sin(angle + Math.PI * 0.4) * size)
          ctx.closePath()
          ctx.stroke()
        }
        ctx.restore()
      }

      // Wireframe hand abstraction
      const cx = W / 2
      const cy = H / 2.3 + scroll * 80
      ctx.save()
      ctx.translate(cx, cy)
      ctx.strokeStyle = `rgba(${r + 30}, ${g}, ${b + 40}, ${0.4 + pulse * 0.3})`
      ctx.lineWidth = 2

      // Palm
      ctx.beginPath()
      ctx.moveTo(-50, 0)
      ctx.lineTo(-30, -60)
      ctx.lineTo(30, -60)
      ctx.lineTo(50, 0)
      ctx.lineTo(30, 50)
      ctx.lineTo(-30, 50)
      ctx.closePath()
      ctx.stroke()

      // Fingers as geometric lines
      for (let i = 0; i < 5; i++) {
        const fx = -40 + i * 20
        ctx.beginPath()
        ctx.moveTo(fx, -60)
        ctx.lineTo(fx, -100 - i * 8)
        ctx.stroke()
      }
      ctx.restore()
    },
    [themeColor],
  )

  const drawMeshTheme = useCallback(
    (ctx: CanvasRenderingContext2D, t: number, W: number, H: number, scroll: number, pulse: number) => {
      const [r, g, b] = themeColor

      // Dense mesh grid
      const gridSize = 80
      const cols = Math.ceil(W / gridSize) + 1
      const rows = Math.ceil(H / gridSize) + 1

      const points: {x: number, y: number}[] = []
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * gridSize + Math.sin(t * 0.0003 + row * 0.5) * 20
          const y = row * gridSize + Math.cos(t * 0.0002 + col * 0.5) * 20 + scroll * 30
          points.push({x, y})
        }
      }

      // Draw mesh connections with spatial optimization
      ctx.strokeStyle = `rgba(${r}, ${g + 30}, ${b + 20}, ${0.15 + pulse * 0.1})`
      ctx.lineWidth = 1
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i]
        // Only check nearby points to reduce complexity
        for (let j = i + 1; j < Math.min(i + 20, points.length); j++) {
          const p2 = points[j]
          const dist = Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2)
          if (dist < gridSize * 1.5) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      // Draw nodes
      points.forEach((p) => {
        ctx.fillStyle = `rgba(${r + 50}, ${g + 30}, ${b + 40}, ${0.4 + pulse * 0.3})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
        ctx.fill()
      })
    },
    [themeColor],
  )

  const drawNeonTheme = useCallback(
    (ctx: CanvasRenderingContext2D, t: number, W: number, H: number, scroll: number, pulse: number) => {
      // Neon flow with rainbow gradient effects
      const centerX = W / 2
      const centerY = H / 2.5 + scroll * 80

      // Flowing neon streams
      for (let stream = 0; stream < 6; stream++) {
        const hue = (stream / 6) * 360 + t * 0.05
        const streamAngle = (stream / 6) * Math.PI * 2

        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(streamAngle + t * 0.0003)

        const gradient = ctx.createLinearGradient(0, 0, 0, 200)
        const r = Math.sin(hue * Math.PI / 180) * 127 + 128
        const g = Math.sin((hue + 120) * Math.PI / 180) * 127 + 128
        const b = Math.sin((hue + 240) * Math.PI / 180) * 127 + 128

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.3 + pulse * 0.3})`)
        gradient.addColorStop(0.5, `rgba(${b}, ${r}, ${g}, ${0.2 + pulse * 0.2})`)
        gradient.addColorStop(1, `rgba(${g}, ${b}, ${r}, 0)`)

        ctx.strokeStyle = gradient
        ctx.lineWidth = 3 + pulse * 2
        ctx.beginPath()
        for (let i = 0; i < 200; i++) {
          const y = i
          const x = Math.sin(i * 0.05 + t * 0.005) * 50
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.restore()
      }

      // Neon glow particles
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + t * 0.001
        const radius = 120 + Math.sin(t * 0.002 + i) * 40
        const px = centerX + Math.cos(angle) * radius
        const py = centerY + Math.sin(angle) * radius
        const hue = (i / 20) * 360 + t * 0.1
        const r = Math.sin(hue * Math.PI / 180) * 127 + 128
        const g = Math.sin((hue + 120) * Math.PI / 180) * 127 + 128
        const b = Math.sin((hue + 240) * Math.PI / 180) * 127 + 128

        const particleGradient = ctx.createRadialGradient(px, py, 0, px, py, 15)
        particleGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.6 + pulse * 0.3})`)
        particleGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
        ctx.fillStyle = particleGradient
        ctx.beginPath()
        ctx.arc(px, py, 15, 0, Math.PI * 2)
        ctx.fill()
      }
    },
    [themeColor],
  )

  const drawCircuitHandTheme = useCallback(
    (ctx: CanvasRenderingContext2D, t: number, W: number, H: number, scroll: number, pulse: number) => {
      const [r, g, b] = themeColor
      const cx = W / 2
      const cy = H / 2.3 + scroll * 80

      ctx.save()
      ctx.translate(cx, cy)

      // Circuit-style hand outline
      ctx.strokeStyle = `rgba(${r + 50}, ${g + 30}, ${b + 60}, ${0.5 + pulse * 0.3})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 60) // Wrist
      ctx.lineTo(-40, 30)
      ctx.lineTo(-50, -10)
      ctx.lineTo(-40, -50) // Pinky
      ctx.lineTo(-20, -80) // Ring
      ctx.lineTo(0, -90) // Middle
      ctx.lineTo(20, -85) // Index
      ctx.lineTo(40, -60) // Thumb
      ctx.lineTo(50, -10)
      ctx.lineTo(40, 30)
      ctx.closePath()
      ctx.stroke()

      // Circuit traces on palm
      const traces = [
        [{x: -30, y: 20}, {x: -20, y: -10}, {x: -10, y: -30}],
        [{x: -10, y: 20}, {x: 0, y: -15}, {x: 0, y: -40}],
        [{x: 10, y: 20}, {x: 20, y: -10}, {x: 10, y: -35}],
        [{x: 30, y: 20}, {x: 30, y: -5}, {x: 25, y: -25}],
      ]

      traces.forEach((trace, idx) => {
        const progress = (t * 0.001 + idx * 0.3) % 1
        ctx.strokeStyle = `rgba(${r}, ${g + 40}, ${b + 80}, 0.4)`
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(trace[0].x, trace[0].y)
        trace.forEach(p => ctx.lineTo(p.x, p.y))
        ctx.stroke()

        // Flowing particle
        const progressIdx = Math.floor(progress * (trace.length - 1))
        if (progressIdx < trace.length - 1) {
          const p1 = trace[progressIdx]
          const p2 = trace[progressIdx + 1]
          const localProgress = (progress * (trace.length - 1)) % 1
          const px = p1.x + (p2.x - p1.x) * localProgress
          const py = p1.y + (p2.y - p1.y) * localProgress

          ctx.fillStyle = `rgba(${r + 100}, ${g + 60}, ${b + 100}, ${0.8 + pulse * 0.2})`
          ctx.beginPath()
          ctx.arc(px, py, 3, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Circuit nodes at joints
      const nodes = [
        {x: -40, y: -50}, {x: -20, y: -80}, {x: 0, y: -90},
        {x: 20, y: -85}, {x: 40, y: -60}, {x: 0, y: 0}
      ]
      nodes.forEach(node => {
        ctx.strokeStyle = `rgba(${r + 80}, ${g + 50}, ${b + 90}, ${0.6 + pulse * 0.3})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(node.x, node.y, 6, 0, Math.PI * 2)
        ctx.stroke()
      })

      ctx.restore()
    },
    [themeColor],
  )

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

    const onVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === "visible"
      if (isVisibleRef.current) {
        stateRef.current.lastT = performance.now()
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

    const modeRef = { current: mode }
    const sealPulseRef = { current: sealPulse }
    const themeColorRef = { current: themeColor }
    const backgroundThemeRef = { current: backgroundTheme }

    const step = (t: number) => {
      if (!isVisibleRef.current) {
        frameRef.current = requestAnimationFrame(step)
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
      const currentPulse = sealPulseRef.current
      const currentBgTheme = backgroundThemeRef.current

      const vg = ctx.createRadialGradient(W * 0.45, H * 0.22, 40, W * 0.5, H * 0.52, Math.max(W, H) * 0.85)
      vg.addColorStop(0, `rgba(127,180,255,${0.1 + depth * 0.06})`)
      vg.addColorStop(0.45, `rgba(20,30,70,${0.03 + depth * 0.04})`)
      vg.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, W, H)

      if (currentBgTheme === "wireframe") {
        drawWireframeTheme(ctx, t, W, H, scroll, currentPulse)
      } else if (currentBgTheme === "circuit") {
        drawCircuitTheme(ctx, t, W, H, scroll, currentPulse)
      } else if (currentBgTheme === "cosmic") {
        drawCosmicTheme(ctx, t, W, H, scroll, currentPulse)
      } else if (currentBgTheme === "geometric") {
        drawGeometricTheme(ctx, t, W, H, scroll, currentPulse)
      } else if (currentBgTheme === "mesh") {
        drawMeshTheme(ctx, t, W, H, scroll, currentPulse)
      } else if (currentBgTheme === "neon") {
        drawNeonTheme(ctx, t, W, H, scroll, currentPulse)
      } else if (currentBgTheme === "circuit-hand") {
        drawCircuitHandTheme(ctx, t, W, H, scroll, currentPulse)
      }

      const shouldDrawFullNeural = currentBgTheme === "neural"

      const currentMode = modeRef.current
      const intensity = currentMode === "live" ? 1.45 : 1.0
      const px = (pointerRef.current.x - 0.5) * 12 * intensity
      const py = (pointerRef.current.y - 0.5) * 12 * intensity

      const nodes = nodesRef.current
      const jitter = currentMode === "live" ? 0.1 : 0.06
      const scrollFactor = 1 + scroll * 0.2

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
      const linkBoost = (currentMode === "live" ? 1.2 : 1.0) + currentPulse * 0.8

      let linkCount = 0
      const nodeLen = nodes.length

      if (shouldDrawFullNeural) {
        ctx.beginPath()
        for (let i = 0; i < nodeLen; i++) {
          const a = nodes[i]
          ctx.moveTo(a.x + a.r, a.y)
          ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2)
        }
        ctx.fillStyle = "rgba(200,220,255,0.16)"
        ctx.fill()

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
      } else {
        ctx.fillStyle = "rgba(200,220,255,0.12)"
        ctx.beginPath()
        for (let i = 0; i < nodeLen; i++) {
          const a = nodes[i]
          ctx.moveTo(a.x + a.r * 0.5, a.y)
          ctx.arc(a.x, a.y, a.r * 0.5, 0, Math.PI * 2)
        }
        ctx.fill()
      }

      if (shouldDrawFullNeural) {
        const cx = W * 0.5 + px * 2.6
        const cy = H * (0.28 + scroll * 0.08) + py * 2.2

        const ringA = 0.1 + currentPulse * 0.12
        ctx.strokeStyle = `rgba(255,255,255,${ringA})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.ellipse(cx, cy, 150 + currentPulse * 20, 76 + currentPulse * 10, 0.22, 0, Math.PI * 2)
        ctx.stroke()

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
      }

      ctx.fillStyle = "rgba(255,255,255,0.03)"
      for (let k = 0; k < 4; k++) {
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1)
      }

      updateStats(nodeLen, linkCount)
      frameRef.current = requestAnimationFrame(step)
    }

    const syncInterval = setInterval(() => {
      modeRef.current = mode
      sealPulseRef.current = sealPulse
      themeColorRef.current = themeColor
      backgroundThemeRef.current = backgroundTheme

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
    backgroundTheme,
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
    drawWireframeTheme,
    drawCircuitTheme,
    drawCosmicTheme,
    drawGeometricTheme,
    drawMeshTheme,
    drawNeonTheme,
    drawCircuitHandTheme,
  ])

  return <canvas ref={canvasRef} id="bg" className="fixed inset-0 w-full h-full block z-0 bg-transparent touch-none" />
}

export const CanvasBackground = memo(CanvasBackgroundInner)
