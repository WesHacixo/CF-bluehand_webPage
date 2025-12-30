"use client"

import { memo, useCallback } from "react"
import { useApp } from "./app-provider"
import { ServiceCard } from "./service-card"

const services = [
  {
    key: "sovereign" as const,
    title: "Sovereign AI",
    description: "LLMs + embeddings running on your machines—Mac minis to multi-node clusters.",
  },
  {
    key: "pipeline" as const,
    title: "Secure Pipelines",
    description: "Encrypted, auditable flows from ingestion to inference—no training leakage.",
  },
  {
    key: "mesh" as const,
    title: "Agent Mesh",
    description: "Orchestrated agents with boundary + governance, not uncontrolled automation.",
  },
  {
    key: "interface" as const,
    title: "Human Interface",
    description: "Chat/canvas/dashboards that keep complex intelligence legible and usable.",
  },
]

function HeroSectionInner() {
  const { openContactForm } = useApp()

  const handleOpenContactForm = useCallback(() => openContactForm(), [openContactForm])

  return (
    <section className="panel" id="work">
      <div className="fade" />
      <h2 className="text-[clamp(28px,4.2vw,52px)] mt-1 mb-4 leading-[1.05] tracking-[-0.02em] text-balance">
        Private Intelligence.
        <br />
        Elegant Systems.
      </h2>
      <p className="m-0 text-[rgba(234,240,255,0.88)] max-w-[62ch] text-[clamp(14px,1.35vw,17px)] leading-relaxed">
        Bluehand designs and deploys <strong>sovereign intelligence stacks</strong>—local-first models, secure data
        pipelines, and governed agent meshes—so your organization stops renting its mind.
      </p>

      <div className="cta-row flex gap-3 flex-wrap mt-6 items-center">
        <button className="btn" onClick={handleOpenContactForm}>
          Request a Sovereignty Audit
        </button>
        <a className="btn alt" href="mailto:hello@bluehand.solutions">
          Email Directly
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8" id="proof">
        {services.map((service) => (
          <ServiceCard
            key={service.key}
            themeKey={service.key}
            title={service.title}
            description={service.description}
          />
        ))}
      </div>
    </section>
  )
}

export const HeroSection = memo(HeroSectionInner)
