"use client"

import { memo, useEffect, useState, useRef } from "react"
import Image from "next/image"
import { useApp } from "./app-provider"

function HeroShowcaseInner() {
  const { backgroundTheme, mode, cycleBackgroundTheme, toggleMode } = useApp()
  const [mounted, setMounted] = useState(false)
  const [showLogo, setShowLogo] = useState(true)
  const [logoOpacity, setLogoOpacity] = useState(1)
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)

    // Start fading out logo after 2.5 seconds
    fadeTimerRef.current = setTimeout(() => {
      setLogoOpacity(0)
      // Remove logo from DOM after fade completes
      setTimeout(() => {
        setShowLogo(false)
      }, 2000)
    }, 2500)

    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current)
      }
    }
  }, [])

  return (
    <section className="relative w-full min-h-[50vh] md:min-h-[60vh] lg:min-h-[65vh] flex flex-col items-center justify-center overflow-hidden rounded-[18px]">
      {/* Subtle border frame to define the showcase area */}
      <div className="absolute inset-0 rounded-[18px] border border-white/10 pointer-events-none" />

      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-[18px] pointer-events-none bg-gradient-to-b from-[rgba(127,180,255,0.08)] via-transparent to-[rgba(127,180,255,0.04)]" />

      {/* Theme indicator - top right */}
      <div className="absolute top-4 right-4 z-20">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[rgba(234,240,255,0.5)] bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
          {backgroundTheme === "neural" && "Neural"}
          {backgroundTheme === "wireframe" && "Wireframe"}
          {backgroundTheme === "circuit" && "Circuit"}
          {backgroundTheme === "cosmic" && "Cosmic"}
          {backgroundTheme === "geometric" && "Geometric"}
          {backgroundTheme === "mesh" && "Mesh"}
          {backgroundTheme === "neon" && "Neon"}
          {backgroundTheme === "circuit-hand" && "Circuit Hand"}
        </div>
      </div>

      {/* Controls - top left */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button
          onClick={toggleMode}
          className="text-[10px] uppercase tracking-[0.15em] text-[rgba(234,240,255,0.7)] bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 hover:border-[rgba(127,180,255,0.4)] hover:bg-black/50 transition-all"
        >
          {mode === "calm" ? "Calm" : "Live"}
        </button>
        <button
          onClick={cycleBackgroundTheme}
          className="text-[10px] uppercase tracking-[0.15em] text-[rgba(234,240,255,0.7)] bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 hover:border-[rgba(127,180,255,0.4)] hover:bg-black/50 transition-all"
        >
          Theme
        </button>
      </div>

      {/* Hamsa logo - fades out to reveal canvas */}
      {showLogo && (
        <div
          className="relative z-10 w-[240px] h-[320px] md:w-[280px] md:h-[380px] lg:w-[320px] lg:h-[420px] transition-opacity duration-[2000ms] ease-out"
          style={{ opacity: logoOpacity }}
        >
          <Image
            src="/images/hamsa-cyan.png"
            alt="Bluehand Hamsa"
            fill
            className="object-contain"
            style={{
              filter: "drop-shadow(0 0 60px rgba(127,180,255,0.5)) drop-shadow(0 0 120px rgba(127,180,255,0.25))",
            }}
            priority
          />
        </div>
      )}

      {/* Tagline appears after logo fades */}
      <div
        className={`absolute bottom-8 left-0 right-0 text-center transition-opacity duration-1000 ${
          mounted && !showLogo ? "opacity-100" : "opacity-0"
        }`}
      >
        <p className="text-[11px] md:text-xs uppercase tracking-[0.25em] text-[rgba(234,240,255,0.45)]">
          Interactive canvas — click and drag to shape your constellation
        </p>
      </div>

      {/* Floating particles hint - visible only when logo is gone */}
      {!showLogo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border border-dashed border-white/5 animate-pulse" />
        </div>
      )}
    </section>
  )
}

export const HeroShowcase = memo(HeroShowcaseInner)
