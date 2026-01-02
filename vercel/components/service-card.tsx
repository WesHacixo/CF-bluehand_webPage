"use client"

import { memo, useCallback } from "react"
import { useApp } from "./app-provider"
import type { ServiceKey } from "./service-detail-modal"

interface ServiceCardProps {
  themeKey: ServiceKey
  title: string
  description: string
}

function ServiceCardInner({ themeKey, title, description }: ServiceCardProps) {
  const { openServiceDetail } = useApp()

  const handleClick = useCallback(() => {
    openServiceDetail(themeKey)
  }, [openServiceDetail, themeKey])

  return (
    <div className="card cursor-pointer group" onClick={handleClick}>
      <p className="k">{title}</p>
      <p className="v">{description}</p>
    </div>
  )
}

export const ServiceCard = memo(ServiceCardInner)
