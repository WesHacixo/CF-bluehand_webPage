"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import type { ServiceKey } from "./service-detail-modal"

type Mode = "calm" | "live"
type Theme = "neutral" | "sovereign" | "pipeline" | "mesh" | "interface" | "research" | "startup" | "ip" | "privacy"
type BackgroundTheme = "neural" | "wireframe" | "circuit"
type AtmosphericMode = "cinematic" | "ambient" | "rotating"
type ViewportZone = "atmospheric" | "exchange" | "engagement"

interface MediaAsset {
  id: string
  type: "video" | "image" | "photo-stream"
  src: string | string[]
  duration?: number
  aspectRatio?: "16:9" | "21:9" | "custom"
  poster?: string
}

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

  // Atmospheric Frame state
  atmosphericMode: AtmosphericMode
  hasSeenIntro: boolean
  currentMedia: MediaAsset | null
  activeZone: ViewportZone
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

  // Atmospheric Frame methods
  completeIntro: () => void
  rotateMedia: () => void
  setActiveZone: (zone: ViewportZone) => void
  getNextMedia: () => MediaAsset
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
  // Media library (will move to separate file later)
  const MEDIA_LIBRARY = {
    cinematic: {
      id: "intro-v1",
      type: "video" as const,
      src: "/media/intro-cinematic.mp4",
      poster: "/media/intro-poster.jpg",
      duration: 30,
      aspectRatio: "16:9" as const,
    },
    ambient: [
      {
        id: "ambient-placeholder",
        type: "video" as const,
        src: "/media/ambient-loop.mp4",
        duration: 0,
      },
    ],
  }

  const [state, setState] = useState<AppState>(() => {
    // Check localStorage for intro flag
    const hasSeenIntro = typeof window !== "undefined"
      ? localStorage.getItem('bluehand:intro-seen') === 'true'
      : false

    return {
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

      // Atmospheric state
      atmosphericMode: hasSeenIntro ? "ambient" : "cinematic",
      hasSeenIntro,
      currentMedia: hasSeenIntro ? MEDIA_LIBRARY.ambient[0] : MEDIA_LIBRARY.cinematic,
      activeZone: "atmospheric",
    }
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
      const themes: BackgroundTheme[] = ["neural", "wireframe", "circuit"]
      const currentIndex = themes.indexOf(prev.backgroundTheme)
      const nextIndex = (currentIndex + 1) % themes.length
      return { ...prev, backgroundTheme: themes[nextIndex], sealPulse: Math.min(1, prev.sealPulse + 0.6) }
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
    setState((prev) => ({
      ...prev,
      selectedService: key,
      isServiceDetailOpen: true,
      theme: key,
      sealPulse: Math.min(1, prev.sealPulse + 0.3),
    }))
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

  // Atmospheric Frame methods
  const completeIntro = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem('bluehand:intro-seen', 'true')
    }
    setState((prev) => ({
      ...prev,
      atmosphericMode: "ambient",
      hasSeenIntro: true,
      currentMedia: MEDIA_LIBRARY.ambient[0],
    }))
  }, [])

  const getNextMedia = useCallback((): MediaAsset => {
    const pool = MEDIA_LIBRARY.ambient
    const currentId = state.currentMedia?.id
    const availableMedia = pool.filter(m => m.id !== currentId)
    const randomIndex = Math.floor(Math.random() * availableMedia.length)
    return availableMedia[randomIndex] || pool[0]
  }, [state.currentMedia])

  const rotateMedia = useCallback(() => {
    const nextMedia = getNextMedia()
    setState((prev) => ({
      ...prev,
      atmosphericMode: "rotating",
      currentMedia: nextMedia,
    }))
  }, [getNextMedia])

  const setActiveZone = useCallback((zone: ViewportZone) => {
    setState((prev) => ({ ...prev, activeZone: zone }))
  }, [])

  useEffect(() => {
    if (state.mode === "live") {
      const interval = setInterval(() => {
        cycleBackgroundTheme()
      }, 45000) // 45 seconds
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
        completeIntro,
        rotateMedia,
        setActiveZone,
        getNextMedia,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export type { BackgroundTheme, AtmosphericMode, ViewportZone, MediaAsset }
