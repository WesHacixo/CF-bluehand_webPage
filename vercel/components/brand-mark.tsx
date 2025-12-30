"use client"

import { memo } from "react"

function BrandMarkInner() {
  return (
    <div
      className="w-[34px] h-[34px] rounded-full relative overflow-hidden border border-white/20 shadow-[0_0_32px_rgba(127,180,255,0.20)]"
      style={{
        background: `
          radial-gradient(circle at 30% 30%, rgba(127,180,255,.9), rgba(127,180,255,.05) 60%),
          radial-gradient(circle at 70% 70%, rgba(255,181,90,.6), rgba(255,181,90,.03) 58%),
          radial-gradient(circle at 40% 75%, rgba(255,93,125,.55), rgba(255,93,125,.03) 62%)
        `,
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-[6px] rounded-full border border-white/20 opacity-70" />
      <div className="absolute inset-[9px] rounded-full border border-dashed border-white/15 opacity-60 animate-spin-slow" />
    </div>
  )
}

export const BrandMark = memo(BrandMarkInner)
