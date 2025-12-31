import { Header } from "@/components/header"
import { AtmosphericFrame } from "@/components/atmospheric-frame"
import { HeroSection } from "@/components/hero-section"
import { SidePanel } from "@/components/side-panel"
import { AuditSection } from "@/components/audit-section"
import { Footer } from "@/components/footer"
import { CanvasBackground } from "@/components/canvas-background"
import { CanvasBriefModal } from "@/components/canvas-brief-modal"
import { ContactFormModal } from "@/components/contact-form-modal"
import { CanvasPlayground } from "@/components/canvas-playground"
import { AppProvider } from "@/components/app-provider"
import { ServiceDetailModalWrapper } from "@/components/service-detail-modal-wrapper"

export default function Home() {
  return (
    <AppProvider>
      <CanvasBackground />
      <div className="shell relative z-[1] min-h-screen flex flex-col p-[clamp(16px,3vw,40px)] gap-10 md:gap-12">
        <Header />

        <AtmosphericFrame />

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-[1.35fr_0.65fr] gap-8 lg:gap-10 items-start">
          <HeroSection />
          <SidePanel />
        </main>

        <AuditSection />

        <CanvasPlayground />

        <Footer />
      </div>
      <CanvasBriefModal />
      <ContactFormModal />
      <ServiceDetailModalWrapper />
    </AppProvider>
  )
}
