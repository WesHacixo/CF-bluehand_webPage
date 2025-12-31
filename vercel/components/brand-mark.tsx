"use client"

import { memo } from "react"
import Image from "next/image"

function BrandMarkInner() {
  return (
    <div className="w-[44px] h-[44px] relative flex-shrink-0 group" aria-hidden="true">
      {/* Subtle ring - only visible on hover */}
      <div className="absolute inset-0 rounded-full border border-[#7fb4ff]/20 opacity-0 group-hover:opacity-100 group-hover:border-[#7fb4ff]/40 transition-all duration-300" />

      {/* Logo with hover glow enhancement */}
      <div className="relative w-full h-full transition-all duration-300 group-hover:scale-105">
        <Image
          src="/images/bluehand-orb-logo.png"
          alt="Bluehand logo"
          width={44}
          height={44}
          className="w-full h-full object-contain rounded-full transition-all duration-300"
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
