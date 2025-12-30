"use client"

import { memo, useCallback } from "react"
import { useApp } from "./app-provider"
import { BrandMark } from "./brand-mark"

function HeaderInner() {
  const { mode, toggleMode } = useApp()

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  return (
    <header className="flex items-center justify-between gap-[14px] flex-wrap">
      <div className="brand flex items-center gap-3 select-none animate-fade-in-up" aria-label="Bluehand brand">
        <BrandMark />
        <div>
          <h1 className="text-sm tracking-[0.22em] m-0 uppercase text-[rgba(234,240,255,0.95)]">BLUEHAND.SOLUTIONS</h1>
          <div className="text-xs mt-0.5 text-[#a9b7e6] tracking-[0.12em] uppercase">Own Your Intelligence</div>
        </div>
      </div>

      <nav className="flex gap-2.5 items-center flex-wrap justify-end animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <button className="pill" onClick={() => scrollToSection("work")}>
          Work
        </button>
        <button className="pill" onClick={() => scrollToSection("audit")}>
          Sovereignty Audit
        </button>
        <button className="pill" aria-pressed={mode === "live"} onClick={toggleMode}>
          Mode: {mode === "calm" ? "Calm" : "Live"}
        </button>
        <a className="pill" href="mailto:hello@bluehand.solutions">
          Email
        </a>
      </nav>
    </header>
  )
}

export const Header = memo(HeaderInner)
