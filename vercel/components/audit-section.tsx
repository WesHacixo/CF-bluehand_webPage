"use client"

import { memo, useCallback } from "react"
import { useApp } from "./app-provider"
import type { CanvasPlaygroundHandle } from "./canvas-playground"

interface AuditSectionProps {
  canvasPlaygroundRef: React.RefObject<CanvasPlaygroundHandle>
}

function AuditSectionInner({ canvasPlaygroundRef }: AuditSectionProps) {
  const { openModal, openContactForm } = useApp()

  const handleDropConstellation = useCallback(() => {
    // Drop a new manipulable constellation at center
    canvasPlaygroundRef.current?.dropConstellation()
  }, [canvasPlaygroundRef])

  const handleOpenModal = useCallback(() => openModal(), [openModal])
  const handleOpenContactForm = useCallback(() => openContactForm(), [openContactForm])

  return (
    <section className="panel" id="audit">
      <div className="fade" />
      <h3 className="m-0 mb-2.5 tracking-[0.18em] uppercase text-sm">Sovereignty Audit</h3>
      <p className="m-0 text-[rgba(212,223,245,0.84)] leading-relaxed max-w-[80ch]">
        A short, high-signal engagement to map your data, risk, and compute realities—then design a sovereign path:
        local-first where possible, secure hybrid where necessary, and governed throughout.
      </p>

      <div className="cta-row flex gap-2.5 flex-wrap mt-[14px] items-center">
        <button className="btn" onClick={handleOpenContactForm}>
          Request an Audit
        </button>
        <button className="btn alt" onClick={handleDropConstellation}>
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
