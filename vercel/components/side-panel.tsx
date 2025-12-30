"use client"

import { memo, useCallback } from "react"
import { useApp } from "./app-provider"
import type { ServiceKey } from "./service-detail-modal"

const audiences = [
  {
    key: "research" as const,
    title: "Labs & Research",
    description: "Local inference + reproducible pipelines. Evidence, not hype.",
  },
  {
    key: "startup" as const,
    title: "Startups",
    description: "Build defensibility by owning the stack and the memory.",
  },
  {
    key: "ip" as const,
    title: "Artists & IP",
    description: "Private creative engines; your style stays yours.",
  },
  {
    key: "privacy" as const,
    title: "NGOs & Privacy",
    description: "Controlled, non-extractive intelligence infrastructure.",
  },
]

function AudienceItem({
  themeKey,
  title,
  description,
  onClick,
}: {
  themeKey: ServiceKey
  title: string
  description: string
  onClick: (key: ServiceKey) => void
}) {
  const handleClick = useCallback(() => onClick(themeKey), [onClick, themeKey])

  return (
    <div className="item cursor-pointer group" onClick={handleClick}>
      <b className="flex items-center justify-between">
        {title}
        <span className="text-[10px] font-normal opacity-50 group-hover:opacity-80 transition-opacity">
          Learn more →
        </span>
      </b>
      <span>{description}</span>
    </div>
  )
}

const MemoizedAudienceItem = memo(AudienceItem)

function SidePanelInner() {
  const { openServiceDetail } = useApp()

  const handleClick = useCallback(
    (key: ServiceKey) => {
      openServiceDetail(key)
    },
    [openServiceDetail],
  )

  return (
    <aside className="panel side">
      <div className="fade" />
      <h3 className="m-0 mb-3 text-sm tracking-[0.18em] uppercase text-[rgba(234,240,255,0.90)]">Who this is for</h3>
      <p className="m-0 mb-5 text-[rgba(234,240,255,0.78)] text-[13px] leading-relaxed">
        Teams with proprietary data, privacy requirements, or simple refusal to be platform-dependent.
      </p>

      <div className="flex flex-col gap-4">
        {audiences.map((audience) => (
          <MemoizedAudienceItem
            key={audience.key}
            themeKey={audience.key}
            title={audience.title}
            description={audience.description}
            onClick={handleClick}
          />
        ))}
      </div>
    </aside>
  )
}

export const SidePanel = memo(SidePanelInner)
