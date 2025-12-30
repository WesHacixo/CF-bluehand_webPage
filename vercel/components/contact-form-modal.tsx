"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useApp } from "./app-provider"

interface FormData {
  name: string
  email: string
  organization: string
  context: string
  constraints: string
  goal: string
  timeline: string
  honeypot: string // Added honeypot field
}

const initialFormData: FormData = {
  name: "",
  email: "",
  organization: "",
  context: "",
  constraints: "",
  goal: "",
  timeline: "",
  honeypot: "",
}

export function ContactFormModal() {
  const { isContactFormOpen, closeContactForm, pulseSeal } = useApp()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const firstInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeContactForm()
      }
    }
    if (isContactFormOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [closeContactForm, isContactFormOpen])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      setSubmitStatus("idle")
      setErrorMessage("")

      try {
        const response = await fetch("/api/brief", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Submission failed")
        }

        setIsSubmitting(false)
        setSubmitStatus("success")
        pulseSeal()

        // If fallback mode, show the message
        if (data.fallback) {
          setErrorMessage(data.message)
        }

        // Reset and close after success
        setTimeout(() => {
          setFormData(initialFormData)
          setSubmitStatus("idle")
          setErrorMessage("")
          closeContactForm()
        }, 3000)
      } catch (error) {
        setIsSubmitting(false)
        setSubmitStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "Something went wrong. Please email us directly.")
      }
    },
    [formData, pulseSeal, closeContactForm],
  )

  if (!isContactFormOpen) return null

  return (
    <div
      className="fixed inset-0 z-[5] bg-black/55 backdrop-blur-[10px] p-[clamp(16px,3vw,36px)] overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeContactForm()
      }}
    >
      <div className="max-w-[680px] mx-auto mt-[4vh] mb-[4vh] border border-white/15 rounded-[18px] bg-[rgba(10,18,45,0.75)] shadow-[0_30px_90px_rgba(0,0,0,0.55)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-2.5 p-[14px_16px] border-b border-white/10">
          <div className="tracking-[0.18em] uppercase text-xs text-[rgba(234,240,255,0.92)]">
            Request Sovereignty Audit
          </div>
          <button className="pill" onClick={closeContactForm}>
            Close
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <input
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={handleChange}
            className="absolute -left-[9999px] opacity-0 pointer-events-none"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {/* Name & Email Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-field">
              <label htmlFor="name" className="form-label">
                Name <span className="text-[#ff5d7d]">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="Your name"
              />
            </div>
            <div className="form-field">
              <label htmlFor="email" className="form-label">
                Email <span className="text-[#ff5d7d]">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
                placeholder="you@company.com"
              />
            </div>
          </div>

          {/* Organization */}
          <div className="form-field">
            <label htmlFor="organization" className="form-label">
              Organization
            </label>
            <input
              type="text"
              id="organization"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              className="form-input"
              placeholder="Company or team name"
            />
          </div>

          {/* Context */}
          <div className="form-field">
            <label htmlFor="context" className="form-label">
              Context <span className="text-[#ff5d7d]">*</span>
            </label>
            <textarea
              id="context"
              name="context"
              value={formData.context}
              onChange={handleChange}
              required
              rows={3}
              className="form-input resize-none"
              placeholder="Tell us about your current situation, data locations, and what you're working with..."
            />
          </div>

          {/* Constraints */}
          <div className="form-field">
            <label htmlFor="constraints" className="form-label">
              Constraints
            </label>
            <textarea
              id="constraints"
              name="constraints"
              value={formData.constraints}
              onChange={handleChange}
              rows={2}
              className="form-input resize-none"
              placeholder="Privacy requirements, budget limits, technical constraints..."
            />
          </div>

          {/* Goal */}
          <div className="form-field">
            <label htmlFor="goal" className="form-label">
              Goal <span className="text-[#ff5d7d]">*</span>
            </label>
            <textarea
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              required
              rows={2}
              className="form-input resize-none"
              placeholder="What does success look like for you?"
            />
          </div>

          {/* Timeline */}
          <div className="form-field">
            <label htmlFor="timeline" className="form-label">
              Timeline
            </label>
            <select
              id="timeline"
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">Select timeline...</option>
              <option value="immediate">Immediate (1-2 weeks)</option>
              <option value="soon">Soon (1-2 months)</option>
              <option value="planning">Planning phase (3+ months)</option>
              <option value="exploring">Just exploring</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
            <button type="button" className="btn alt" onClick={closeContactForm}>
              Cancel
            </button>
            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : submitStatus === "success" ? "Sent!" : "Send Request"}
            </button>
          </div>

          {/* Status messages */}
          {submitStatus === "success" && (
            <p className="text-center text-[#7fb4ff] text-sm">Request received! We'll be in touch soon.</p>
          )}
          {submitStatus === "error" && (
            <p className="text-center text-[#ff5d7d] text-sm">
              {errorMessage}{" "}
              <a href="mailto:hello@bluehand.solutions" className="underline hover:no-underline">
                Email us directly
              </a>
            </p>
          )}
          {errorMessage && submitStatus === "success" && (
            <p className="text-center text-[#ffb55a] text-xs">{errorMessage}</p>
          )}
        </form>
      </div>
    </div>
  )
}
