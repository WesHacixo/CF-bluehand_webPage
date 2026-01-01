"use client"

import { memo } from "react"
import Image from "next/image"

function BrandMarkInner() {
  return (
    <div className="w-[44px] h-[44px] relative flex-shrink-0" aria-hidden="true">
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
        onError={(e) => {
          console.warn('Logo image failed to load:', e);
          // Fallback to CSS-based logo if image fails
        }}
      />
    </div>
  )
}

export const BrandMark = memo(BrandMarkInner)
