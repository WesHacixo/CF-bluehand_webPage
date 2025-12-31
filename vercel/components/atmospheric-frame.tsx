"use client"

import { memo, useEffect, useRef, useState } from "react"
import { useApp } from "./app-provider"
import { cn } from "@/lib/utils"

function AtmosphericFrameInner() {
  const {
    atmosphericMode,
    hasSeenIntro,
    currentMedia,
    completeIntro,
    rotateMedia,
    activeZone,
  } = useApp()

  const [canSkip, setCanSkip] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [isFolding, setIsFolding] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Enable skip button after 5 seconds (like YouTube)
  useEffect(() => {
    if (atmosphericMode === "cinematic") {
      const timer = setTimeout(() => setCanSkip(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [atmosphericMode])

  // Track video progress
  useEffect(() => {
    const video = videoRef.current
    if (!video || atmosphericMode !== "cinematic") return

    const updateProgress = () => {
      const progress = (video.currentTime / (currentMedia?.duration || 30)) * 100
      setVideoProgress(progress)
    }

    video.addEventListener("timeupdate", updateProgress)
    return () => video.removeEventListener("timeupdate", updateProgress)
  }, [atmosphericMode, currentMedia])

  // Handle video end with fold reveal animation
  const handleVideoEnd = () => {
    if (atmosphericMode === "cinematic") {
      setIsFolding(true)
      // Trigger fold animation, then complete intro after animation
      setTimeout(() => {
        completeIntro()
        setIsFolding(false)
      }, 1000) // Match animation duration
    }
  }

  // Handle skip button
  const handleSkip = () => {
    if (atmosphericMode === "cinematic") {
      setIsFolding(true)
      setTimeout(() => {
        completeIntro()
        setIsFolding(false)
      }, 1000)
    }
  }

  // Viewport zone detection for media rotation
  useEffect(() => {
    if (!hasSeenIntro || !sectionRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // When frame comes back into view after scrolling away, rotate media
          if (entry.isIntersecting && entry.intersectionRatio > 0.8) {
            rotateMedia()
          }
        })
      },
      { threshold: 0.8 }
    )

    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [hasSeenIntro, rotateMedia])

  if (!currentMedia) return null

  const isCinematic = atmosphericMode === "cinematic"

  return (
    <section
      ref={sectionRef}
      id="atmospheric-frame"
      data-zone="atmospheric"
      className={cn(
        "relative overflow-hidden transition-all duration-1000",
        isCinematic && !isFolding
          ? "fixed inset-0 z-50 bg-black" // Full cinematic takeover
          : "rounded-[18px] h-[60vh] md:h-[70vh]", // Ambient mode
        isFolding && "cinematic-fold" // Fold reveal animation
      )}
    >
      {/* Video Player with fallback */}
      {currentMedia.type === "video" && !videoError && (
        <video
          ref={videoRef}
          src={currentMedia.src as string}
          poster={currentMedia.poster}
          autoPlay
          muted
          loop={!isCinematic}
          playsInline
          onEnded={handleVideoEnd}
          onError={() => setVideoError(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Fallback gradient when video unavailable */}
      {(videoError || currentMedia.type === "video" && !currentMedia.src) && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#050814] via-[#07102a] to-[#0a1433]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 px-4">
              <div className="text-h3 text-primary tracking-[0.18em] uppercase">Bluehand.Solutions</div>
              <div className="text-sm text-secondary max-w-md">
                Own Your Intelligence
              </div>
              <div className="text-xs text-disabled">
                [Media asset placeholder - add video to /public{currentMedia.src}]
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Stream (for future implementation) */}
      {currentMedia.type === "photo-stream" && Array.isArray(currentMedia.src) && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#050814] to-[#07102a]">
          {/* TODO: Implement photo crossfade carousel */}
          <div className="w-full h-full flex items-center justify-center text-muted text-sm">
            Photo Stream (Coming Soon)
          </div>
        </div>
      )}

      {/* Cinematic Mode Overlays */}
      {isCinematic && (
        <>
          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
            <div
              className="h-full bg-accent transition-all duration-200"
              style={{ width: `${videoProgress}%` }}
            />
          </div>

          {/* Skip Button (after 5s) */}
          {canSkip && (
            <button
              onClick={handleSkip}
              className="absolute bottom-8 right-8 z-20 text-2xs uppercase tracking-wider text-muted hover:text-primary bg-black/60 hover:bg-black/80 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 hover:border-accent/40 transition-all"
            >
              Skip Intro →
            </button>
          )}
        </>
      )}

      {/* Ambient/Rotating Mode Overlays */}
      {!isCinematic && (
        <>
          {/* Subtle border frame */}
          <div className="absolute inset-0 rounded-[18px] border border-white/10 pointer-events-none" />

          {/* Minimal branding */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-10">
            <p className="text-2xs text-disabled uppercase tracking-[0.25em]">
              Own Your Intelligence
            </p>
          </div>
        </>
      )}
    </section>
  )
}

export const AtmosphericFrame = memo(AtmosphericFrameInner)
