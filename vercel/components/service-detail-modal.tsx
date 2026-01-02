"use client"

import { useEffect, useCallback, useState } from "react"
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
      "Organizations with strict data sovereignty requirements—government agencies, defense contractors, healthcare systems handling PHI, financial institutions under data localization laws—face a fundamental tension: they need AI capabilities for operational efficiency, but cannot expose sensitive data to cloud-based inference services. The Semantic Genesis Protocol addresses sovereign deployment through a containerized, air-gap-compatible architecture that maintains full audit capability without network dependencies. SGP introduces read-only audit layers that enable external verification of inference processes without modifying operational state, and implements zero-knowledge reasoning patterns that preserve validity proofs across semantic transformations.",
    whatWeDeliver: [
      "Containerized, air-gap-compatible architecture",
      "Read-only audit layers for external verification",
      "Zero-knowledge reasoning patterns with validity proofs",
      "Graceful degradation for offline operation",
      "Knowledge state reconciliation algorithms",
    ],
    requirements: [
      "Data sovereignty requirements (FedRAMP/CMMC/HIPAA)",
      "Compute budget for local deployment",
      "Latency + throughput requirements",
      "Team technical capacity for air-gap operations",
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
      "The Semantic Genesis Protocol (SGP) addresses the critical gap in AI interpretability through a self-documenting knowledge graph architecture that embeds cryptographic provenance directly into inference processes. Modern AI systems produce outputs whose reasoning chains remain opaque to users, auditors, and regulators. SGP introduces Merkleized causality graphs that record the transformation history of knowledge objects, enabling post-hoc verification that outputs derive legitimately from declared sources. The protocol employs semantic anonymization techniques that preserve structural invariants while protecting sensitive content, allowing reasoning validity to be verified without exposing raw data.",
    whatWeDeliver: [
      "Merkleized causality graphs for verifiable audit trails",
      "Semantic anonymization preserving structural invariants",
      "Formal framework for semantic invariance under transformation",
      "Performance-optimized cryptographic overhead validation",
      "Research infrastructure with version-controlled models",
    ],
    requirements: [
      "Research domain + experimental use cases",
      "Compute resources for cryptographic operations",
      "Team capacity for category-theoretic methods",
      "Publication + reproducibility requirements",
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

// Expandable content popup component
function ExpandableContentPopup({
  isOpen,
  onClose,
  title,
  content,
}: {
  isOpen: boolean
  onClose: () => void
  title: string
  content: string | string[]
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[10] bg-black/70 backdrop-blur-[8px] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="max-w-[600px] w-full border border-white/15 rounded-[18px] bg-[rgba(10,18,45,0.95)] shadow-[0_30px_90px_rgba(0,0,0,0.65)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2.5 p-[14px_16px] border-b border-white/10">
          <div className="text-xs tracking-[0.14em] uppercase text-[rgba(234,240,255,0.92)]">{title}</div>
          <button
            className="pill"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {typeof content === "string" ? (
            <p className="text-[rgba(234,240,255,0.85)] text-[15px] leading-relaxed m-0 whitespace-pre-wrap">
              {content}
            </p>
          ) : (
            <ul className="m-0 pl-4 text-[rgba(169,183,230,0.95)] text-[14px] leading-relaxed flex flex-col gap-2">
              {content.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export function ServiceDetailModal({ serviceKey, isOpen, onClose }: ServiceDetailModalProps) {
  const { openContactForm, pulseSeal } = useApp()
  const [expandedSection, setExpandedSection] = useState<{
    type: "whatItIs" | "whatWeDeliver" | "requirements"
    title: string
  } | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (expandedSection) {
          setExpandedSection(null)
        } else {
          onClose()
        }
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [isOpen, onClose, expandedSection])

  const handleCTA = useCallback(() => {
    pulseSeal()
    onClose()
    // Small delay to let the close animation happen
    setTimeout(() => openContactForm(), 150)
  }, [pulseSeal, onClose, openContactForm])

  const handleClose = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation()
      }
      onClose()
    },
    [onClose]
  )

  if (!isOpen || !serviceKey) return null

  const detail = serviceDetails[serviceKey]

  return (
    <>
      <div
        className="fixed inset-0 z-[5] bg-black/60 backdrop-blur-[12px] p-[clamp(16px,3vw,36px)] flex items-center justify-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose()
        }}
      >
        <div className="max-w-[720px] w-full border border-white/15 rounded-[18px] bg-[rgba(10,18,45,0.80)] shadow-[0_30px_90px_rgba(0,0,0,0.55)] overflow-hidden max-h-[85vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5 p-[14px_16px] border-b border-white/10 flex-shrink-0">
            <div>
              <div className="tracking-[0.18em] uppercase text-xs text-[rgba(234,240,255,0.92)]">{detail.title}</div>
              <div className="text-[rgba(169,183,230,0.9)] text-sm mt-1">{detail.tagline}</div>
            </div>
            <button
              className="pill"
              onClick={handleClose}
            >
              Close
            </button>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col gap-5 overflow-y-auto flex-1 min-h-0">
            {/* What it is */}
            <div
              className="card cursor-pointer"
              data-theme={serviceKey}
              onClick={() => setExpandedSection({ type: "whatItIs", title: "What it is" })}
            >
              <h4 className="k">What it is</h4>
              <p className="v line-clamp-3">
                {detail.whatItIs}
              </p>
            </div>

            {/* Two column grid for deliverables and requirements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* What we deliver */}
              <div
                className="card cursor-pointer"
                data-theme={serviceKey}
                onClick={() => setExpandedSection({ type: "whatWeDeliver", title: "What we deliver" })}
              >
                <p className="k">What we deliver</p>
                <ul className="m-0 pl-4 text-[rgba(169,183,230,0.95)] text-[13px] leading-relaxed flex flex-col gap-1">
                  {detail.whatWeDeliver.slice(0, 3).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                  {detail.whatWeDeliver.length > 3 && (
                    <li className="text-[rgba(169,183,230,0.6)] italic">+{detail.whatWeDeliver.length - 3} more...</li>
                  )}
                </ul>
              </div>

              {/* What it requires */}
              <div
                className="card cursor-pointer"
                data-theme={serviceKey}
                onClick={() => setExpandedSection({ type: "requirements", title: "What it requires" })}
              >
                <p className="k">What it requires</p>
                <ul className="m-0 pl-4 text-[rgba(169,183,230,0.95)] text-[13px] leading-relaxed flex flex-col gap-1">
                  {detail.requirements.slice(0, 3).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                  {detail.requirements.length > 3 && (
                    <li className="text-[rgba(169,183,230,0.6)] italic">+{detail.requirements.length - 3} more...</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="px-5 pb-5 flex gap-2.5 flex-wrap items-center flex-shrink-0 border-t border-white/10 pt-4 mt-2">
            <button className="btn" onClick={handleCTA}>
              {detail.cta}
            </button>
            <button className="btn alt" onClick={handleClose}>
              Back
            </button>
            <span className="text-[rgba(169,183,230,0.7)] text-xs ml-auto">or email hello@bluehand.solutions</span>
          </div>
        </div>
      </div>

      {/* Expandable content popup */}
      {expandedSection && (
        <ExpandableContentPopup
          isOpen={!!expandedSection}
          onClose={() => setExpandedSection(null)}
          title={expandedSection.title}
          content={
            expandedSection.type === "whatItIs"
              ? detail.whatItIs
              : expandedSection.type === "whatWeDeliver"
                ? detail.whatWeDeliver
                : detail.requirements
          }
        />
      )}
    </>
  )
}
