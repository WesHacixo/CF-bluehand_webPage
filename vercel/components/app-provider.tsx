"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { ServiceKey } from "./service-detail-modal"
import { BACKGROUND_THEMES, type BackgroundTheme } from "../lib/themes"

type Mode = "calm" | "live"
type Theme = "neutral" | "sovereign" | "pipeline" | "mesh" | "interface" | "research" | "startup" | "ip" | "privacy"

interface AppState {
  mode: Mode
  theme: Theme
  backgroundTheme: BackgroundTheme
  sealPulse: number
  burst: number
  isModalOpen: boolean
  isContactFormOpen: boolean
  selectedService: ServiceKey | null
  isServiceDetailOpen: boolean
  nodeCount: number
  linkCount: number
}

interface AppContextType extends AppState {
  toggleMode: () => void
  setTheme: (theme: Theme) => void
  setBackgroundTheme: (theme: BackgroundTheme) => void
  cycleBackgroundTheme: () => void
  pulseSeal: () => void
  spawnBurst: () => void
  openModal: () => void
  closeModal: () => void
  openContactForm: () => void
  closeContactForm: () => void
  openServiceDetail: (key: ServiceKey) => void
  closeServiceDetail: () => void
  updateStats: (nodes: number, links: number) => void
  setSealPulse: (value: number) => void
  setBurst: (value: number) => void
}

const AppContext = createContext<AppContextType | null>(null)

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    mode: "calm",
    theme: "neutral",
    backgroundTheme: "neural",
    sealPulse: 0,
    burst: 0,
    isModalOpen: false,
    isContactFormOpen: false,
    selectedService: null,
    isServiceDetailOpen: false,
    nodeCount: 0,
    linkCount: 0,
  })

  const toggleMode = useCallback(() => {
    setState((prev) => ({ ...prev, mode: prev.mode === "calm" ? "live" : "calm" }))
  }, [])

  const setTheme = useCallback((theme: Theme) => {
    setState((prev) => ({ ...prev, theme, sealPulse: Math.min(1, prev.sealPulse + 0.45) }))
  }, [])

  const setBackgroundTheme = useCallback((backgroundTheme: BackgroundTheme) => {
    setState((prev) => ({ ...prev, backgroundTheme, sealPulse: Math.min(1, prev.sealPulse + 0.6) }))
  }, [])

  const cycleBackgroundTheme = useCallback(() => {
    setState((prev) => {
      const currentIndex = BACKGROUND_THEMES.indexOf(prev.backgroundTheme)
      const nextIndex = (currentIndex + 1) % BACKGROUND_THEMES.length
      return {
        ...prev,
        backgroundTheme: BACKGROUND_THEMES[nextIndex],
        sealPulse: Math.min(1, prev.sealPulse + 0.6),
      }
    })
  }, [])

  const pulseSeal = useCallback(() => {
    setState((prev) => ({ ...prev, sealPulse: Math.min(1, prev.sealPulse + 0.85) }))
  }, [])

  const spawnBurst = useCallback(() => {
    setState((prev) => ({ ...prev, burst: Math.min(1, prev.burst + 0.85) }))
  }, [])

  const openModal = useCallback(() => {
    setState((prev) => ({ ...prev, isModalOpen: true }))
  }, [])

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, isModalOpen: false }))
  }, [])

  const openContactForm = useCallback(() => {
    setState((prev) => ({ ...prev, isContactFormOpen: true }))
  }, [])

  const closeContactForm = useCallback(() => {
    setState((prev) => ({ ...prev, isContactFormOpen: false }))
  }, [])

  const openServiceDetail = useCallback((key: ServiceKey) => {
    setState((prev) => {
      // Map service keys to background themes for dynamic backgrounds
      const backgroundThemeMap: Record<ServiceKey, BackgroundTheme> = {
        sovereign: "neural",
        pipeline: "circuit",
        mesh: "mesh",
        interface: "wireframe",
        research: "cosmic",
        startup: "geometric",
        ip: "neon",
        privacy: "circuit-hand",
      }
      return {
        ...prev,
        selectedService: key,
        isServiceDetailOpen: true,
        theme: key,
        backgroundTheme: backgroundThemeMap[key] || prev.backgroundTheme,
        sealPulse: Math.min(1, prev.sealPulse + 0.3),
      }
    })
  }, [])

  const closeServiceDetail = useCallback(() => {
    setState((prev) => ({ ...prev, isServiceDetailOpen: false }))
  }, [])

  const updateStats = useCallback((nodes: number, links: number) => {
    setState((prev) => ({ ...prev, nodeCount: nodes, linkCount: links }))
  }, [])

  const setSealPulse = useCallback((value: number) => {
    setState((prev) => ({ ...prev, sealPulse: value }))
  }, [])

  const setBurst = useCallback((value: number) => {
    setState((prev) => ({ ...prev, burst: value }))
  }, [])

  useEffect(() => {
    if (state.mode === "live") {
      const interval = setInterval(() => {
        cycleBackgroundTheme()
      }, 120000) // 2 minutes
      return () => clearInterval(interval)
    }
  }, [state.mode, cycleBackgroundTheme])

  return (
    <AppContext.Provider
      value={{
        ...state,
        toggleMode,
        setTheme,
        setBackgroundTheme,
        cycleBackgroundTheme,
        pulseSeal,
        spawnBurst,
        openModal,
        closeModal,
        openContactForm,
        closeContactForm,
        openServiceDetail,
        closeServiceDetail,
        updateStats,
        setSealPulse,
        setBurst,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}


