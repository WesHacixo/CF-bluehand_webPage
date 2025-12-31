"use client"

import { memo, useCallback } from "react"
import { useApp } from "./app-provider"

function AuditSectionInner() {
  const { spawnBurst, openModal, openContactForm } = useApp()

  const handleSpawnBurst = useCallback(() => spawnBurst(), [spawnBurst])
  const handleOpenModal = useCallback(() => openModal(), [openModal])
  const handleOpenContactForm = useCallback(() => openContactForm(), [openContactForm])

  return (
    <section className="panel" id="audit">
      <div className="fade" />
      <h3 className="m-0 mb-4 tracking-[0.18em] uppercase text-h3 text-primary">Sovereignty Audit</h3>
      <p className="m-0 text-secondary text-base leading-relaxed max-w-[80ch]">
        A short, high-signal engagement to map your data, risk, and compute realities—then design a sovereign path:
        local-first where possible, secure hybrid where necessary, and governed throughout.
      </p>

      <div className="cta-row flex gap-3 flex-wrap mt-6 items-center">
        <button className="btn" onClick={handleOpenContactForm}>
          Request an Audit
        </button>
        <button className="btn alt" onClick={handleSpawnBurst}>
          Drop a Constellation
        </button>
        <button className="btn alt" onClick={handleOpenModal}>
          Open Canvas Brief
        </button>
      </div>
    </section>
  )
}

export const AuditSection = memo(AuditSectionInner)
