import { memo } from "react"

function FooterInner() {
  return (
    <footer className="flex justify-between gap-3 items-center text-muted text-xs tracking-[0.08em] pb-[env(safe-area-inset-bottom)]">
      <div>© {new Date().getFullYear()} Bluehand.Solutions</div>
      <div className="text-tertiary">Sovereign intelligence, elegantly delivered.</div>
    </footer>
  )
}

export const Footer = memo(FooterInner)
