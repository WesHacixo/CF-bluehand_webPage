"use client"

import { useApp } from "./app-provider"
import { useEffect } from "react"

const briefItems = [
  {
    title: "Inputs we need",
    description: "Data locations • privacy constraints • success metric • latency tolerance • budget • team capability",
  },
  {
    title: "Outputs you receive",
    description: "Architecture sketch • deployment plan • risks + mitigations • next-step roadmap",
  },
  {
    title: "Non-negotiables",
    description: "Ownership • auditability • minimal leakage • practical operations",
  },
  {
    title: "Ethos",
    description: "Right-livelihood engineering: no dark patterns, no forced dependency.",
  },
]

export function CanvasBriefModal() {
  const { isModalOpen, closeModal, openContactForm } = useApp()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal()
      }
    }
    if (isModalOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [closeModal, isModalOpen])

  const handleCTA = () => {
    closeModal()
    setTimeout(() => openContactForm(), 150)
  }

  if (!isModalOpen) return null

  return (
    <div
      className="fixed inset-0 z-[5] bg-black/55 backdrop-blur-[10px] p-[clamp(16px,3vw,36px)] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal()
      }}
    >
      <div className="max-w-[980px] mx-auto mt-[6vh] mb-[4vh] border border-white/15 rounded-[18px] bg-[rgba(10,18,45,0.65)] shadow-[0_30px_90px_rgba(0,0,0,0.55)] overflow-hidden">
        <div className="flex items-center justify-between gap-2.5 p-[14px_16px] border-b border-white/10">
          <div className="tracking-[0.18em] uppercase text-xs text-[rgba(234,240,255,0.92)]">Canvas Brief</div>
          <button className="pill" onClick={closeModal}>
            Close
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {briefItems.map((item) => (
            <div key={item.title} className="card">
              <p className="k">{item.title}</p>
              <p className="v">{item.description}</p>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 flex gap-2.5 flex-wrap items-center">
          <button className="btn" onClick={handleCTA}>
            Start Your Brief
          </button>
          <button className="btn alt" onClick={closeModal}>
            Return
          </button>
          <span className="text-[rgba(169,183,230,0.7)] text-xs ml-auto">or email hello@bluehand.solutions</span>
        </div>
      </div>
    </div>
  )
}
