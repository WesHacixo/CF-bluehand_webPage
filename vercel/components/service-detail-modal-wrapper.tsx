"use client"

import { useApp } from "./app-provider"
import { ServiceDetailModal } from "./service-detail-modal"

export function ServiceDetailModalWrapper() {
  const { selectedService, isServiceDetailOpen, closeServiceDetail } = useApp()

  return <ServiceDetailModal serviceKey={selectedService} isOpen={isServiceDetailOpen} onClose={closeServiceDetail} />
}
