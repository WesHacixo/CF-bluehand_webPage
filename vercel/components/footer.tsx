import { memo } from "react"

function FooterInner() {
  return (
    <footer className="flex justify-between gap-3 items-center text-[#a9b7e6]/85 text-xs tracking-[0.08em] pb-[env(safe-area-inset-bottom)]">
      <div>© {new Date().getFullYear()} Bluehand.Solutions</div>
      <div className="opacity-90">Sovereign intelligence, elegantly delivered.</div>
    </footer>
  )
}

export const Footer = memo(FooterInner)
