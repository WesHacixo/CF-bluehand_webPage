"use client"

import { memo, useEffect, useState, useRef } from "react"
import Image from "next/image"
import { useApp } from "./app-provider"

function BrandMarkInner() {
  const { backgroundTheme } = useApp()
  const [opacity, setOpacity] = useState(1)
  const prevThemeRef = useRef(backgroundTheme)

  useEffect(() => {
    if (prevThemeRef.current !== backgroundTheme) {
      // Fade out on theme change
      setOpacity(0)
      const timer = setTimeout(() => {
        // Fade back in
        setOpacity(1)
      }, 400)
      prevThemeRef.current = backgroundTheme
      return () => clearTimeout(timer)
    }
  }, [backgroundTheme])

  return (
    <div 
      className="w-[44px] h-[44px] relative flex-shrink-0 transition-opacity duration-500" 
      aria-hidden="true"
      style={{ opacity }}
    >
      <Image
        src="/images/bluehand-orb/bluehand-orb.webp"
        alt="Bluehand logo"
        width={44}
        height={44}
        className="w-full h-full object-contain rounded-full"
        style={{
          filter: "drop-shadow(0 0 12px rgba(127,180,255,0.4)) drop-shadow(0 0 24px rgba(127,180,255,0.2))",
        }}
        priority
        onError={(e) => {
          console.warn('Logo image failed to load:', e);
        }}
      />
    </div>
  )
}

export const BrandMark = memo(BrandMarkInner)
