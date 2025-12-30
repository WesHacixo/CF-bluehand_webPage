"use client"

import { useEffect, useCallback } from "react"
import { useApp } from "./app-provider"

export type ServiceKey = "sovereign" | "pipeline" | "mesh" | "interface" | "research" | "startup" | "ip" | "privacy"

interface ServiceDetail {
  title: string
  tagline: string
  whatItIs: string
  whatWeDeliver: string[]
  requirements: string[]
  cta: string
}

const serviceDetails: Record<ServiceKey, ServiceDetail> = {
  sovereign: {
    title: "Sovereign AI",
    tagline: "Your models. Your machines. Your control.",
    whatItIs:
      "Local-first LLM and embedding deployments that run entirely on infrastructure you control—from Mac minis to multi-node GPU clusters. No API calls leaving your perimeter, no training data leakage, no vendor lock-in.",
    whatWeDeliver: [
      "Hardware spec + procurement guidance",
      "Model selection (open-weight, fine-tunable)",
      "Deployment architecture + orchestration",
      "Performance tuning + monitoring setup",
      "Upgrade path documentation",
    ],
    requirements: [
      "Clear use case definition",
      "Compute budget range",
      "Latency + throughput requirements",
      "Team technical capacity assessment",
    ],
    cta: "Request Sovereign AI Audit",
  },
  pipeline: {
    title: "Secure Pipelines",
    tagline: "Data flows you can trust and audit.",
    whatItIs:
      "End-to-end encrypted, auditable data pipelines from ingestion to inference. Every transformation logged, every access controlled, every output traceable. Built for compliance without sacrificing speed.",
    whatWeDeliver: [
      "Data flow architecture + encryption scheme",
      "Access control + audit logging system",
      "Pipeline orchestration setup",
      "Compliance documentation",
      "Monitoring + alerting configuration",
    ],
    requirements: [
      "Current data sources + formats",
      "Compliance requirements (GDPR, HIPAA, etc.)",
      "Retention + deletion policies",
      "Integration points documentation",
    ],
    cta: "Request Pipeline Audit",
  },
  mesh: {
    title: "Agent Mesh",
    tagline: "Orchestrated intelligence with boundaries.",
    whatItIs:
      "Multi-agent systems with explicit governance: each agent has defined capabilities, resource limits, and human oversight checkpoints. Autonomous where useful, controlled where necessary.",
    whatWeDeliver: [
      "Agent architecture + capability mapping",
      "Governance framework + override protocols",
      "Inter-agent communication design",
      "Resource allocation + rate limiting",
      "Observability + debugging tools",
    ],
    requirements: [
      "Automation goals + success criteria",
      "Risk tolerance assessment",
      "Human-in-the-loop requirements",
      "Existing tool/API inventory",
    ],
    cta: "Request Agent Mesh Audit",
  },
  interface: {
    title: "Human Interface",
    tagline: "Complex intelligence made legible.",
    whatItIs:
      "Chat interfaces, visual canvases, and dashboards that make sophisticated AI systems understandable and usable by real teams. Not just pretty—actually functional for daily work.",
    whatWeDeliver: [
      "Interface design + prototype",
      "Frontend implementation (React/Next.js)",
      "Backend integration architecture",
      "User feedback + iteration system",
      "Documentation + training materials",
    ],
    requirements: [
      "User roles + workflows",
      "Existing systems to integrate",
      "Performance requirements",
      "Branding + design constraints",
    ],
    cta: "Request Interface Audit",
  },
  research: {
    title: "Labs & Research",
    tagline: "Evidence over hype. Reproducibility by default.",
    whatItIs:
      "Research teams need inference infrastructure that doesn't compromise experimental integrity. We build local setups with version-controlled models, reproducible pipelines, and clean separation between exploration and production.",
    whatWeDeliver: [
      "Local inference environment",
      "Experiment tracking integration",
      "Model versioning system",
      "Reproducibility documentation",
      "Collaboration workflow design",
    ],
    requirements: [
      "Research domain + use cases",
      "Compute resources available",
      "Team size + collaboration needs",
      "Publication + sharing requirements",
    ],
    cta: "Request Research Audit",
  },
  startup: {
    title: "Startups",
    tagline: "Build defensibility by owning the stack.",
    whatItIs:
      "Early-stage teams that build on rented infrastructure create dependency, not defensibility. We help you own your AI stack from day one—creating real moats while staying lean.",
    whatWeDeliver: [
      "Stack ownership roadmap",
      "Build vs. buy analysis",
      "MVP architecture design",
      "Scaling path documentation",
      "Technical due diligence prep",
    ],
    requirements: [
      "Product vision + use cases",
      "Current technical stack",
      "Funding + runway context",
      "Team capabilities assessment",
    ],
    cta: "Request Startup Audit",
  },
  ip: {
    title: "Artists & IP",
    tagline: "Your style stays yours.",
    whatItIs:
      "Creative professionals and IP holders need AI tools that enhance rather than extract. Private creative engines trained on your work, running locally, with no risk of style leakage to foundation model training sets.",
    whatWeDeliver: [
      "Private model training setup",
      "Style preservation architecture",
      "Local generation environment",
      "IP protection documentation",
      "Workflow integration",
    ],
    requirements: [
      "Creative domain + workflow",
      "Training data inventory",
      "Output quality requirements",
      "Distribution + licensing needs",
    ],
    cta: "Request Creative Audit",
  },
  privacy: {
    title: "NGOs & Privacy",
    tagline: "Non-extractive intelligence infrastructure.",
    whatItIs:
      "Organizations handling sensitive data—advocacy, healthcare, vulnerable populations—need AI that serves without surveilling. We build privacy-first systems where data protection isn't a feature, it's the foundation.",
    whatWeDeliver: [
      "Privacy-first architecture",
      "Data minimization framework",
      "Access control + audit system",
      "Compliance documentation",
      "Staff training materials",
    ],
    requirements: [
      "Data sensitivity classification",
      "Regulatory requirements",
      "Stakeholder trust constraints",
      "Operational capacity",
    ],
    cta: "Request Privacy Audit",
  },
}

interface ServiceDetailModalProps {
  serviceKey: ServiceKey | null
  isOpen: boolean
  onClose: () => void
}

export function ServiceDetailModal({ serviceKey, isOpen, onClose }: ServiceDetailModalProps) {
  const { openContactForm, pulseSeal } = useApp()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose])

  const handleCTA = useCallback(() => {
    pulseSeal()
    onClose()
    // Small delay to let the close animation happen
    setTimeout(() => openContactForm(), 150)
  }, [pulseSeal, onClose, openContactForm])

  if (!isOpen || !serviceKey) return null

  const detail = serviceDetails[serviceKey]

  return (
    <div
      className="fixed inset-0 z-[5] bg-black/60 backdrop-blur-[12px] p-[clamp(16px,3vw,36px)] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="max-w-[720px] mx-auto mt-[4vh] mb-[4vh] border border-white/15 rounded-[18px] bg-[rgba(10,18,45,0.80)] shadow-[0_30px_90px_rgba(0,0,0,0.55)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2.5 p-[14px_16px] border-b border-white/10">
          <div>
            <div className="tracking-[0.18em] uppercase text-xs text-[rgba(234,240,255,0.92)]">{detail.title}</div>
            <div className="text-[rgba(169,183,230,0.9)] text-sm mt-1">{detail.tagline}</div>
          </div>
          <button className="pill" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-5">
          {/* What it is */}
          <div>
            <h4 className="text-xs tracking-[0.14em] uppercase text-[rgba(234,240,255,0.85)] mb-2">What it is</h4>
            <p className="text-[rgba(234,240,255,0.78)] text-[15px] leading-relaxed m-0">{detail.whatItIs}</p>
          </div>

          {/* Two column grid for deliverables and requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* What we deliver */}
            <div className="card !bg-[rgba(127,180,255,0.06)]">
              <p className="k">What we deliver</p>
              <ul className="m-0 pl-4 text-[rgba(169,183,230,0.95)] text-[13px] leading-relaxed flex flex-col gap-1">
                {detail.whatWeDeliver.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* What it requires */}
            <div className="card !bg-[rgba(255,181,90,0.06)]">
              <p className="k">What it requires</p>
              <ul className="m-0 pl-4 text-[rgba(169,183,230,0.95)] text-[13px] leading-relaxed flex flex-col gap-1">
                {detail.requirements.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="px-5 pb-5 flex gap-2.5 flex-wrap items-center">
          <button className="btn" onClick={handleCTA}>
            {detail.cta}
          </button>
          <button className="btn alt" onClick={onClose}>
            Back
          </button>
          <span className="text-[rgba(169,183,230,0.7)] text-xs ml-auto">or email hello@bluehand.solutions</span>
        </div>
      </div>
    </div>
  )
}
