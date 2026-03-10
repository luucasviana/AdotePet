import Lottie from "lottie-react"
import animationData from "@/assets/loading-animation.json"


/**
 * Full-screen translucent overlay with the Lottie loading animation.
 * Shown on every route change.
 * Respects prefers-reduced-motion: if the user prefers reduced motion,
 * the overlay is shown as a simple static spinner instead.
 */
export function NavigationLoader() {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-sm"
      aria-live="polite"
      aria-label="Carregando página"
      role="status"
    >
      {prefersReduced ? (
        /* Minimal static indicator for reduced-motion users */
        <div className="h-8 w-8 rounded-full border-4 border-[#3B0270]/20 border-t-[#3B0270]" />
      ) : (
        <Lottie
          animationData={animationData}
          loop
          autoplay
          style={{ width: 160, height: 80 }}
          aria-hidden
        />
      )}
    </div>
  )
}
