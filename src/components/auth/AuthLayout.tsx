import { useEffect, useState } from "react"
import { hasSplashBeenSeen, markSplashSeen } from "@/lib/auth-splash"
import { AuthCarousel } from "@/components/auth/AuthCarousel"
import { Button } from "@/components/ui/button"

interface AuthLayoutProps {
  children: React.ReactNode
  /** When true, skips mobile splash (e.g. for /reset-senha) */
  skipSplash?: boolean
}

export function AuthLayout({ children, skipSplash = false }: AuthLayoutProps) {
  const [showSplash, setShowSplash] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const check = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches)
    check(mq)
    mq.addEventListener("change", check)
    return () => mq.removeEventListener("change", check)
  }, [])

  useEffect(() => {
    if (isMobile && !skipSplash && !hasSplashBeenSeen()) {
      setShowSplash(true)
    }
  }, [isMobile, skipSplash])

  const handleSplashDone = () => {
    markSplashSeen()
    setShowSplash(false)
  }

  // MOBILE: Splash screen (fullscreen carousel)
  if (isMobile && showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#3B0270]">
        <AuthCarousel
          className="flex-1 rounded-none"
          onComplete={handleSplashDone}
        />
        {/* Skip button */}
        <div className="absolute top-6 right-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSplashDone}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
          >
            Pular
          </Button>
        </div>
      </div>
    )
  }

  // DESKTOP: 2-column split layout
  // MOBILE (after splash): just the form, full-width
  
  // Check for pending redirect context
  const hasPendingPet = !!localStorage.getItem("pending_pet_redirect")

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-8">
      
      {/* Contextual Message for "Ver detalhes" click */}
      {hasPendingPet && (
        <div className="w-full max-w-5xl mb-6 bg-primary/10 border border-primary/20 rounded-xl p-4 text-center">
            <p className="text-[#3B0270] font-medium text-sm md:text-base">
              Para ver os detalhes deste pet, você precisa estar logado. Se ainda não tiver uma conta, faça seu cadastro para continuar.
            </p>
        </div>
      )}

      <div className="w-full max-w-5xl md:grid md:grid-cols-2 md:gap-8 md:items-stretch">
        {/* Left: Form card */}
        <div className="w-full">
          {children}
        </div>

        {/* Right: Carousel panel (desktop only) */}
        <div className="hidden md:flex">
          <AuthCarousel className="flex-1 min-h-[560px]" />
        </div>
      </div>
    </div>
  )
}
