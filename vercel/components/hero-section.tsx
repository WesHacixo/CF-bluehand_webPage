"use client"

import { memo, useCallback } from "react"
import { useApp } from "./app-provider"
import { ServiceCard } from "./service-card"

// NSF Research Thrusts
const researchThrusts = [
  {
    key: "sovereign" as const,
    title: "Decentralized Infrastructure Research",
    description: "Novel architectures for privacy-preserving distributed systems and local-first computation.",
  },
  {
    key: "pipeline" as const,
    title: "Secure Data Pipeline Design",
    description: "Cryptographic protocols for auditable information flows in networked environments.",
  },
  {
    key: "mesh" as const,
    title: "Multi-Agent Systems Governance",
    description: "Coordination mechanisms for autonomous agents with provable safety boundaries.",
  },
  {
    key: "interface" as const,
    title: "Novel HCI for Complex Systems",
    description: "Gestural and embodied interfaces for intuitive understanding of abstract topologies.",
  },
]

function HeroSectionInner() {
  const { openContactForm } = useApp()

  const handleOpenContactForm = useCallback(() => openContactForm(), [openContactForm])

  return (
    <section className="panel" id="work">
      <div className="fade" />
      <h2 className="text-[clamp(30px,4.6vw,56px)] my-[6px_0_10px_0] leading-[1.02] tracking-[-0.02em] text-balance">
        Open Infrastructure.
        <br />
        Public Research.
      </h2>
      <p className="m-0 text-[rgba(234,240,255,0.88)] max-w-[62ch] text-[clamp(14px,1.35vw,17px)] leading-relaxed">
        Bluehand develops <strong>open-source infrastructure</strong> and <strong>novel interaction paradigms</strong> for
        decentralized systems—advancing privacy-preserving computation, secure coordination protocols, and accessible interfaces
        for complex system understanding.
      </p>

      {/* NSF-specific research statement */}
      <div className="mt-[18px] p-4 bg-[rgba(127,180,255,0.05)] border border-[rgba(127,180,255,0.15)] rounded-lg">
        <div className="text-xs uppercase tracking-wider text-[rgba(127,180,255,0.9)] font-mono mb-2">
          Research Mission
        </div>
        <p className="m-0 text-sm text-[rgba(234,240,255,0.8)] leading-relaxed">
          Our work addresses fundamental questions in distributed systems, cryptographic protocols, and human-computer interaction—
          with emphasis on <strong>broader impacts</strong> through open-source public goods, STEM education tools, and
          accessible privacy technologies.
        </p>
      </div>

      <div className="cta-row flex gap-2.5 flex-wrap mt-[18px] items-center">
        <a className="btn" href="#preliminary-results">
          View Preliminary Results ↓
        </a>
        <a className="btn alt" href="mailto:hello@bluehand.solutions">
          Research Collaboration
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-[18px]" id="proof">
        {researchThrusts.map((thrust) => (
          <ServiceCard
            key={thrust.key}
            themeKey={thrust.key}
            title={thrust.title}
            description={thrust.description}
          />
        ))}
      </div>

      {/* Intellectual Merit + Broader Impacts sections */}
      <div className="mt-[18px] grid grid-cols-1 lg:grid-cols-2 gap-2.5">
        <div className="p-4 bg-[rgba(127,180,255,0.03)] border border-[rgba(127,180,255,0.1)] rounded-lg">
          <h3 className="text-sm font-mono uppercase tracking-wider text-[rgba(127,180,255,0.9)] mb-2">
            Intellectual Merit
          </h3>
          <ul className="m-0 p-0 list-none space-y-2 text-sm text-[rgba(234,240,255,0.75)]">
            <li>• Novel cryptographic protocols for distributed trust</li>
            <li>• Speed-based multi-modal gestural interaction paradigms</li>
            <li>• Governance mechanisms for autonomous multi-agent systems</li>
            <li>• Privacy-preserving computation in resource-constrained environments</li>
          </ul>
        </div>
        <div className="p-4 bg-[rgba(170,210,255,0.03)] border border-[rgba(170,210,255,0.1)] rounded-lg">
          <h3 className="text-sm font-mono uppercase tracking-wider text-[rgba(170,210,255,0.9)] mb-2">
            Broader Impacts
          </h3>
          <ul className="m-0 p-0 list-none space-y-2 text-sm text-[rgba(234,240,255,0.75)]">
            <li>• Open-source infrastructure for privacy-conscious organizations</li>
            <li>• Educational tools for STEM learning (physics, graph theory, networks)</li>
            <li>• Public engagement with complex systems through interactive visualization</li>
            <li>• Accessible decentralized technologies for underserved communities</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export const HeroSection = memo(HeroSectionInner)
