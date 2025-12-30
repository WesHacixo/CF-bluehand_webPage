"use client"

import { memo } from "react"
import Image from "next/image"

function BrandMarkInner() {
  return (
    <div className="w-[44px] h-[44px] relative flex-shrink-0 group" aria-hidden="true">
      {/* Animated glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7fb4ff]/20 via-[#7fb4ff]/10 to-transparent animate-spin-slow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Pulse ring */}
      <div className="absolute inset-0 rounded-full border border-[#7fb4ff]/30 animate-pulse-glow" />

      {/* Logo */}
      <div className="relative w-full h-full transition-transform duration-300 group-hover:scale-110">
        <Image
          src="/images/bluehand-orb-logo.png"
          alt="Bluehand logo"
          width={44}
          height={44}
          className="w-full h-full object-contain rounded-full"
          style={{
            filter: "drop-shadow(0 0 12px rgba(127,180,255,0.4)) drop-shadow(0 0 24px rgba(127,180,255,0.2))",
          }}
          priority
        />
      </div>
    </div>
  )
}

export const BrandMark = memo(BrandMarkInner)
