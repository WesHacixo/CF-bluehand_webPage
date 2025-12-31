"use client"

import { memo, useRef, useEffect, useCallback } from "react"
import { useApp } from "./app-provider"
import type { Theme } from "./app-provider"

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
  // Structural properties for fade effect
  connectionCount?: number // Number of connections this node has
  structuralWeight?: number // Calculated structural importance
  // Quartet rotation properties
  clusterId?: number // ID of the 2x2 cluster this node belongs to
  baseX?: number // Original position relative to cluster center
  baseY?: number
  rotationAngle?: number // Current rotation angle for this cluster
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
const MAX_NODES = 5000 // Significantly increased for rich, complex visualizations

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
  // Quartet rotation state
  const clusterRotationsRef = useRef<Map<number, number>>(new Map()) // clusterId -> rotation angle
  const clusterIdCounterRef = useRef(0)
  const deltaLambdaRef = useRef(0.02) // Rotation speed parameter (radians per frame)
  // Dyad coupling state (pairs of quartets with wave edges)
  const dyadsRef = useRef<Map<number, { clusterA: number; clusterB: number; wavePhase: number; waveAmplitude: number }>>(new Map())
  const dyadIdCounterRef = useRef(0)
  const waveTimeRef = useRef(0) // Global wave time for synchronization

  const { mode, theme, toggleMode, pulseSeal, spawnBurst, sealPulse, burst, setTheme } = useApp()

  const themeColor = THEME_COLORS[theme] || THEME_COLORS.neutral

  // Color options for selector
  const colorOptions: Array<{ key: Theme; label: string }> = [
    { key: "neutral", label: "Neutral" },
    { key: "sovereign", label: "Sovereign" },
    { key: "pipeline", label: "Pipeline" },
    { key: "mesh", label: "Mesh" },
    { key: "interface", label: "Interface" },
    { key: "research", label: "Research" },
    { key: "startup", label: "Startup" },
    { key: "ip", label: "IP" },
    { key: "privacy", label: "Privacy" },
  ]

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
      // Cap nodes - prioritize structural nodes
      if (nodesRef.current.length > MAX_NODES) {
        // Sort by structural importance: keep nodes with more connections, larger size, then by age
        const sorted = [...nodesRef.current].sort((a, b) => {
          const aStructural = (a.connectionCount || 0) + (a.r > 3 ? 1 : 0)
          const bStructural = (b.connectionCount || 0) + (b.r > 3 ? 1 : 0)
          if (aStructural !== bStructural) return bStructural - aStructural
          // Then by kind: keep nodes, then sparks, then trails
          if (a.kind === "node" && b.kind !== "node") return -1
          if (a.kind !== "node" && b.kind === "node") return 1
          // Finally by age (remove oldest)
          return a.age - b.age
        })
        nodesRef.current = sorted.slice(0, MAX_NODES)
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
      const rect = container.getBoundingClientRect()
      const DPR = Math.min(window.devicePixelRatio || 1, 2)
      const W = Math.floor(rect.width)
      const H = Math.floor(rect.height)

      canvas.width = Math.floor(W * DPR)
      canvas.height = Math.floor(H * DPR)
      canvas.style.width = W + "px"
      canvas.style.height = H + "px"
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)

      dimensionsRef.current = { W, H }

      // Seed initial constellation
      if (nodesRef.current.length === 0) {
        for (let i = 0; i < 25; i++) {
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
      const currentPulse = sealPulse
      const currentBurst = burst

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

      // Burst effect - spawn particles from center when burst is active
      // This creates a "constellation drop" effect - multiple clusters spawn
      if (currentBurst > 0.3) {
        const cx = W * 0.5
        const cy = H * 0.5
        const burstCount = Math.min(20, Math.floor(currentBurst * 15))
        // Spawn multiple clusters for constellation effect
        const clusterCount = 3 + Math.floor(currentBurst * 2)
        for (let c = 0; c < clusterCount; c++) {
          const clusterAngle = (Math.PI * 2 * c) / clusterCount
          const clusterDist = 30 + Math.random() * 40
          const clusterX = cx + Math.cos(clusterAngle) * clusterDist
          const clusterY = cy + Math.sin(clusterAngle) * clusterDist
          const particlesPerCluster = Math.floor(burstCount / clusterCount)
          for (let i = 0; i < particlesPerCluster; i++) {
            const angle = (Math.PI * 2 * i) / particlesPerCluster + Math.random() * 0.5
            const speed = 1.5 + Math.random() * 2.5
            const dist = 5 + Math.random() * 15
            const nx = clusterX + Math.cos(angle) * dist
            const ny = clusterY + Math.sin(angle) * dist
            nodesRef.current.push(
              makeNode(nx, ny, Math.cos(angle) * speed, Math.sin(angle) * speed, "spark"),
            )
          }
        }
      }

      // Detect and update 2x2 clusters (quartets) for rotation
      // Group nearby nodes into quartets and apply rotation matrix transformations
      const clusterThreshold = 40 // Maximum distance for nodes to form a quartet
      const clusters = new Map<number, PlaygroundNode[]>()

      // Detect quartets: find groups of 4 nodes close together
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        if (n.kind !== "node" || n.clusterId !== undefined) continue

        // Find nearby nodes to form a quartet
        const nearby: PlaygroundNode[] = [n]
        for (let j = i + 1; j < nodes.length && nearby.length < 4; j++) {
          const other = nodes[j]
          if (other.kind !== "node" || other.clusterId !== undefined) continue

          const dx = other.x - n.x
          const dy = other.y - n.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < clusterThreshold) {
            nearby.push(other)
          }
        }

        // If we found a quartet (4 nodes), assign cluster
        if (nearby.length === 4) {
          const clusterId = clusterIdCounterRef.current++
          nearby.forEach((node) => {
            node.clusterId = clusterId
            clusters.set(clusterId, nearby)
          })

          // Calculate cluster center
          let cx = 0, cy = 0
          nearby.forEach((node) => {
            cx += node.x
            cy += node.y
          })
          cx /= 4
          cy /= 4

          // Store base positions relative to center
          nearby.forEach((node) => {
            node.baseX = node.x - cx
            node.baseY = node.y - cy
          })

          // Initialize rotation angle if not set
          if (!clusterRotationsRef.current.has(clusterId)) {
            clusterRotationsRef.current.set(clusterId, 0)
          }
        }
      }

      // Detect dyads: pair quartets that are close enough to form wave connections
      // This creates fractal wave patterns as groups of particles move in wave-like fashion
      // DYAD FORMATION IS PULSE-DRIVEN: Only forms when pulse is active
      const dyadThreshold = 200 // Maximum distance between quartet centers to form a dyad
      const existingDyads = new Set<string>() // Track existing dyad pairs to avoid duplicates

      // Only detect/form dyads when pulse is active
      if (currentPulse > 0.2) {
        // Pulse intensity affects dyad threshold (stronger pulse = longer connections)
        const pulseDyadThreshold = dyadThreshold * (1 + currentPulse * 0.5)

        for (const [idA, clusterA] of clusters.entries()) {
          if (clusterA.length !== 4) continue

        // Calculate cluster A center
        let cxA = 0, cyA = 0
        clusterA.forEach((node) => {
          cxA += node.x
          cyA += node.y
        })
        cxA /= 4
        cyA /= 4

        for (const [idB, clusterB] of clusters.entries()) {
          if (idA >= idB || clusterB.length !== 4) continue

          // Calculate cluster B center
          let cxB = 0, cyB = 0
          clusterB.forEach((node) => {
            cxB += node.x
            cyB += node.y
          })
          cxB /= 4
          cyB /= 4

          // Check distance between cluster centers
          const dx = cxB - cxA
          const dy = cyB - cyA
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < pulseDyadThreshold) {
            const dyadKey = `${Math.min(idA, idB)}-${Math.max(idA, idB)}`
            if (!existingDyads.has(dyadKey)) {
              existingDyads.add(dyadKey)

              // Check if dyad already exists
              let existingDyadId: number | undefined
              for (const [dyadId, dyad] of dyadsRef.current.entries()) {
                if (
                  (dyad.clusterA === idA && dyad.clusterB === idB) ||
                  (dyad.clusterA === idB && dyad.clusterB === idA)
                ) {
                  existingDyadId = dyadId
                  break
                }
              }

              if (existingDyadId === undefined) {
                // Create new dyad
                const dyadId = dyadIdCounterRef.current++
                dyadsRef.current.set(dyadId, {
                  clusterA: idA,
                  clusterB: idB,
                  wavePhase: Math.random() * Math.PI * 2, // Random initial phase
                  waveAmplitude: 20 + Math.random() * 30, // Wave amplitude (pixels)
                })
              }
            }
          }
        }
        }
      } // End pulse-driven dyad detection

      // Update wave time for synchronized wave motion (only when pulse is active)
      if (currentPulse > 0.1) {
        waveTimeRef.current += dt * 60 * (1 + currentPulse * 0.5) // Faster wave animation during pulse
      }

      // Clean up dyads where clusters are too far apart or no longer exist
      // Also dissolve dyads when pulse ends (below threshold)
      if (currentPulse < 0.1) {
        // Dissolve all dyads when pulse ends
        dyadsRef.current.clear()
      } else {
        // Normal cleanup when pulse is active
        for (const [dyadId, dyad] of dyadsRef.current.entries()) {
          const clusterA = clusters.get(dyad.clusterA)
          const clusterB = clusters.get(dyad.clusterB)

          if (!clusterA || !clusterB || clusterA.length !== 4 || clusterB.length !== 4) {
            dyadsRef.current.delete(dyadId)
            continue
          }

          // Check if clusters are still close enough
          let cxA = 0, cyA = 0
          clusterA.forEach((node) => {
            cxA += node.x
            cyA += node.y
          })
          cxA /= 4
          cyA /= 4

          let cxB = 0, cyB = 0
          clusterB.forEach((node) => {
            cxB += node.x
            cyB += node.y
          })
          cxB /= 4
          cyB /= 4

          const dx = cxB - cxA
          const dy = cyB - cyA
          const dist = Math.sqrt(dx * dx + dy * dy)

          // Use pulse-scaled threshold for cleanup
          const pulseDyadThreshold = dyadThreshold * (1 + currentPulse * 0.5)
          if (dist > pulseDyadThreshold * 1.5) {
            dyadsRef.current.delete(dyadId)
          }
        }
      } // End pulse-based cleanup

      // Update nodes
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i]
        n.age += dt * 60

        // Apply physics
        const friction = n.kind === "trail" ? 0.92 : 0.98
        n.vx *= friction
        n.vy *= friction

        // Gentle random drift for permanent nodes (only if not in a cluster)
        if (n.kind === "node" && n.clusterId === undefined) {
          n.vx += (Math.random() - 0.5) * 0.02
          n.vy += (Math.random() - 0.5) * 0.02
        }

        // Pulse effect - radial expansion with color variation
        if (currentPulse > 0.3) {
          const dx = n.x - W * 0.5
          const dy = n.y - H * 0.5
          const distSq = dx * dx + dy * dy
          if (distSq > 0) {
            const dist = Math.sqrt(distSq)
            const angle = Math.atan2(dy, dx)
            // Radial pulse force
            const pulseForce = currentPulse * 0.2
            n.vx += Math.cos(angle) * pulseForce * dt * 60
            n.vy += Math.sin(angle) * pulseForce * dt * 60
          }
        }

        // Apply quartet rotation matrix transformation
        if (n.clusterId !== undefined && n.baseX !== undefined && n.baseY !== undefined) {
          const clusterNodes = clusters.get(n.clusterId)
          if (clusterNodes && clusterNodes.length === 4) {
            // Calculate cluster center from current positions
            let cx = 0, cy = 0
            clusterNodes.forEach((node) => {
              cx += node.x
              cy += node.y
            })
            cx /= 4
            cy /= 4

            // Get current rotation angle and update it
            let theta = clusterRotationsRef.current.get(n.clusterId) || 0

            // Delta lambda: rotation speed, modulated by time and radial distance for vortex effect
            const time = performance.now() * 0.001 // Time in seconds
            const radialDist = Math.sqrt(n.baseX * n.baseX + n.baseY * n.baseY)
            const vortexModulation = 1 + Math.sin(time * 2 + radialDist * 0.1) * 0.3 // Vortex effect
            const deltaLambda = deltaLambdaRef.current * vortexModulation

            // Update rotation angle
            theta += deltaLambda * dt * 60
            clusterRotationsRef.current.set(n.clusterId, theta)

            // Apply rotation matrix transformation
            // [x']   [cos(θ) -sin(θ)] [x - xc]   [xc]
            // [y'] = [sin(θ)  cos(θ)] [y - yc] + [yc]
            const cosTheta = Math.cos(theta)
            const sinTheta = Math.sin(theta)
            const localX = n.baseX
            const localY = n.baseY

            // Rotate local coordinates
            const rotatedX = cosTheta * localX - sinTheta * localY
            const rotatedY = sinTheta * localX + cosTheta * localY

            // Transform back to world coordinates
            n.x = cx + rotatedX
            n.y = cy + rotatedY

            // Update velocity to match rotation (for smooth motion)
            const angularVelocity = deltaLambda * vortexModulation
            n.vx = -angularVelocity * rotatedY
            n.vy = angularVelocity * rotatedX

            // Apply wave motion along dyad edges (fractal wave propagation)
            // Wave effects are pulse-driven and scale with pulse intensity
            if (currentPulse > 0.2) {
              // Find if this cluster is part of a dyad
              for (const [dyadId, dyad] of dyadsRef.current.entries()) {
                if (dyad.clusterA === n.clusterId || dyad.clusterB === n.clusterId) {
                  const otherClusterId = dyad.clusterA === n.clusterId ? dyad.clusterB : dyad.clusterA
                  const otherCluster = clusters.get(otherClusterId)

                  if (otherCluster && otherCluster.length === 4) {
                    // Calculate other cluster center
                    let cxOther = 0, cyOther = 0
                    otherCluster.forEach((node) => {
                      cxOther += node.x
                      cyOther += node.y
                    })
                    cxOther /= 4
                    cyOther /= 4

                    // Vector from this cluster to other cluster
                    const dx = cxOther - cx
                    const dy = cyOther - cy
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist > 0) {
                      // Normalize direction vector
                      const dirX = dx / dist
                      const dirY = dy / dist

                      // Perpendicular vector for wave oscillation
                      const perpX = -dirY
                      const perpY = dirX

                      // Wave function: sinusoidal motion along the edge
                      // Phase varies with position along the edge and time
                      // Wave intensity scales with pulse
                      const positionAlongEdge = (n.baseX! * dirX + n.baseY! * dirY) / 100 // Normalize
                      const wavePhase = dyad.wavePhase + waveTimeRef.current * 0.05 + positionAlongEdge * 0.5
                      const waveOffset = Math.sin(wavePhase) * dyad.waveAmplitude

                      // Apply wave force perpendicular to the edge (scaled by pulse)
                      const waveForce = waveOffset * 0.15 * dt * 60 * currentPulse
                      n.vx += perpX * waveForce
                      n.vy += perpY * waveForce

                      // Also apply gentle attraction/repulsion along the edge (wave propagation, scaled by pulse)
                      const edgeForce = Math.cos(wavePhase) * 0.05 * dt * 60 * currentPulse
                      n.vx += dirX * edgeForce
                      n.vy += dirY * edgeForce
                    }
                  }
                }
              }
            }
          }
        } else {
          // Standard physics update for non-clustered nodes
          n.x += n.vx
          n.y += n.vy
        }

        // Soft boundary bounce (skip for clustered nodes as rotation handles positioning)
        if (n.clusterId === undefined) {
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
        // Skip merging for clustered nodes (they're already grouped)
        if (n.kind === "spark" && n.age > 60 && n.clusterId === undefined) {
          for (let j = 0; j < nodes.length; j++) {
            if (i === j) continue
            const other = nodes[j]
            if (other.kind !== "node" || other.clusterId !== undefined) continue
            const dx = n.x - other.x
            const dy = n.y - other.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 15) {
              // Merge: transfer momentum and grow the node slightly
              // Merged nodes become more structural (they've formed connections)
              other.vx = (other.vx + n.vx * 0.3) * 0.8
              other.vy = (other.vy + n.vy * 0.3) * 0.8
              other.r = Math.min(6, other.r + 0.1)
              // Increase structural weight when merging (creates stable structures)
              other.connectionCount = (other.connectionCount || 0) + 1
              nodes.splice(i, 1)
              break
            }
          }
        }

        // Clean up clusters when nodes are removed or too far apart
        if (n.clusterId !== undefined) {
          const clusterNodes = clusters.get(n.clusterId)
          if (clusterNodes) {
            // Check if cluster is still valid (all 4 nodes close together)
            let cx = 0, cy = 0
            clusterNodes.forEach((node) => {
              cx += node.x
              cy += node.y
            })
            cx /= clusterNodes.length

            let maxDist = 0
            clusterNodes.forEach((node) => {
              const dx = node.x - cx
              const dy = node.y - cy
              const dist = Math.sqrt(dx * dx + dy * dy)
              maxDist = Math.max(maxDist, dist)
            })

            // If cluster is too spread out, dissolve it
            if (maxDist > clusterThreshold * 1.5) {
              clusterNodes.forEach((node) => {
                node.clusterId = undefined
                node.baseX = undefined
                node.baseY = undefined
              })
              clusterRotationsRef.current.delete(n.clusterId)
              clusters.delete(n.clusterId)
            }
          }
        }
      }

      // Draw dyad wave edges first (fractal wave patterns between quartets)
      // Only render when pulse is active
      if (currentPulse > 0.2) {
        ctx.lineWidth = 2 * (1 + currentPulse * 0.5) // Thicker lines during pulse
        ctx.lineCap = "round"

        for (const [dyadId, dyad] of dyadsRef.current.entries()) {
          const clusterA = clusters.get(dyad.clusterA)
          const clusterB = clusters.get(dyad.clusterB)

          if (!clusterA || !clusterB || clusterA.length !== 4 || clusterB.length !== 4) continue

          // Calculate cluster centers
          let cxA = 0, cyA = 0
          clusterA.forEach((node) => {
            cxA += node.x
            cyA += node.y
          })
          cxA /= 4
          cyA /= 4

          let cxB = 0, cyB = 0
          clusterB.forEach((node) => {
            cxB += node.x
            cyB += node.y
          })
          cxB /= 4
          cyB /= 4

          // Draw wave edge with fractal pattern
          const dx = cxB - cxA
          const dy = cyB - cyA
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist > 0) {
            // Direction vector
            const dirX = dx / dist
            const dirY = dy / dist

            // Perpendicular for wave oscillation
            const perpX = -dirY
            const perpY = dirX

            // Draw wave as a curved path with multiple segments (fractal detail)
            const segments = Math.max(20, Math.floor(dist / 10)) // More segments for longer edges
            ctx.beginPath()

            for (let i = 0; i <= segments; i++) {
              const t = i / segments
              const x = cxA + dx * t
              const y = cyA + dy * t

              // Wave function: multiple frequencies for fractal pattern
              const wave1 = Math.sin(dyad.wavePhase + waveTimeRef.current * 0.05 + t * Math.PI * 2) * dyad.waveAmplitude
              const wave2 = Math.sin(dyad.wavePhase * 2 + waveTimeRef.current * 0.08 + t * Math.PI * 4) * (dyad.waveAmplitude * 0.5)
              const wave3 = Math.sin(dyad.wavePhase * 3 + waveTimeRef.current * 0.12 + t * Math.PI * 8) * (dyad.waveAmplitude * 0.25)
              const totalWave = (wave1 + wave2 + wave3) / 3

              // Apply wave perpendicular to edge
              const waveX = x + perpX * totalWave
              const waveY = y + perpY * totalWave

              if (i === 0) {
                ctx.moveTo(waveX, waveY)
              } else {
                ctx.lineTo(waveX, waveY)
              }
            }

            // Gradient from cluster A to cluster B (intensity scales with pulse)
            const gradient = ctx.createLinearGradient(cxA, cyA, cxB, cyB)
            const baseAlpha = Math.max(0.2, 0.6 - dist / 200)
            const pulseAlpha = baseAlpha * currentPulse * 1.5 // Brighter during pulse
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${255}, ${pulseAlpha})`)
            gradient.addColorStop(0.5, `rgba(${r + 30}, ${g + 20}, ${255}, ${pulseAlpha * 1.5})`)
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${255}, ${pulseAlpha})`)

            ctx.strokeStyle = gradient
            ctx.stroke()
          }
        }
      } // End pulse-driven wave rendering

      // Draw connections with glow effect and track structural importance
      let linkCount = 0
      ctx.lineWidth = 1

      // Reset connection counts for structural weight calculation
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].connectionCount = 0
      }

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
            // Track connections for structural weight
            a.connectionCount = (a.connectionCount || 0) + 1
            b.connectionCount = (b.connectionCount || 0) + 1

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

      // Calculate structural weights for fade effect
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        // Structural weight: higher for connected nodes, larger nodes, and permanent nodes
        let structuralWeight = 1.0
        const connections = n.connectionCount || 0

        if (n.kind === "node") {
          // Permanent nodes with connections are highly structural
          structuralWeight = 1.0 + connections * 0.3 + (n.r > 3 ? 0.5 : 0)
        } else if (n.kind === "spark") {
          // Sparks that have merged/connected are structural
          structuralWeight = 0.5 + connections * 0.2 + (n.r > 2.5 ? 0.2 : 0)
        } else {
          // Trails are ephemeral
          structuralWeight = 0.3
        }

        // Small nodes fade faster (unless they're well-connected)
        if (n.r < 2.5 && connections < 2) {
          structuralWeight *= 0.6
        }

        n.structuralWeight = structuralWeight
      }

      // Draw nodes with structural fade effect
      // Nodes fade slowly to structural points - many small nodes fade faster,
      // leaving geometric structures and connected formations visible longer
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i]
        let alpha = 1
        let radius = n.r

        // Base alpha from lifespan (for temporary nodes)
        if (n.kind === "trail") {
          alpha = Math.max(0, n.life / 60) * 0.6
          radius = n.r * (n.life / 60)
        } else if (n.kind === "spark") {
          alpha = Math.min(1, n.life / 100) * 0.8
        }

        // Apply structural fade: age-based with structural bias
        // Structural nodes (connected, larger, permanent) fade much slower
        const structuralWeight = n.structuralWeight || 1.0
        const maxAge = 2000 * structuralWeight // Structural nodes last longer
        const ageRatio = Math.min(1, n.age / maxAge)
        const structuralFade = 1 - ageRatio * 0.7 // Fade to 30% opacity, not fully transparent

        // Combine lifespan alpha with structural fade
        // For permanent nodes, use structural fade; for temporary, use both
        if (n.kind === "node") {
          alpha *= structuralFade
        } else {
          // For sparks/trails, combine both fade mechanisms
          alpha *= Math.min(structuralFade, 1.0)
        }

        // Glow with structural fade and pulse enhancement
        const glowRadius = radius * (3 + currentPulse * 1.5)
        const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowRadius)
        gradient.addColorStop(0, `rgba(${r + n.hue}, ${g}, ${b}, ${alpha * (0.4 + currentPulse * 0.3)})`)
        gradient.addColorStop(1, `rgba(${r + n.hue}, ${g}, ${b}, 0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2)
        ctx.fill()

        // Core with structural fade and pulse enhancement
        const coreRadius = radius * (1 + currentPulse * 0.2)
        ctx.fillStyle = `rgba(${200 + n.hue}, 220, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, coreRadius, 0, Math.PI * 2)
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
      window.removeEventListener("resize", resize)
      canvas.removeEventListener("mousedown", onPointerDown)
      canvas.removeEventListener("mousemove", onPointerMove)
      canvas.removeEventListener("mouseup", onPointerUp)
      canvas.removeEventListener("mouseleave", onPointerUp)
      canvas.removeEventListener("touchstart", onPointerDown)
      canvas.removeEventListener("touchmove", onPointerMove)
      canvas.removeEventListener("touchend", onPointerUp)
    }
  }, [makeNode, spawnCluster, themeColor, mode, sealPulse, burst, setTheme])

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
        <div className="flex gap-2 flex-wrap items-center">
          {/* Color selector */}
          <div className="flex gap-1">
            {colorOptions.slice(0, 5).map((color) => {
              const [r, g, b] = THEME_COLORS[color.key]
              const isActive = theme === color.key
              return (
                <button
                  key={color.key}
                  onClick={() => setTheme(color.key)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    isActive ? "ring-1 ring-white/60 scale-125" : "opacity-50 hover:opacity-75"
                  }`}
                  style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                  title={color.label}
                />
              )
            })}
          </div>
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
