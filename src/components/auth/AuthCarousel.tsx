import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { PublicImage } from "@/components/shared/PublicImage"

const SLIDES = [
  {
    id: 1,
    src: "/slide-1.png",
    alt: "Cachorro e gato felizes lado a lado",
    headline: "Adoção com segurança\ne transparência",
    support: "Informações claras e processo guiado do início ao fim.",
  },
  {
    id: 2,
    src: "/slide-2.png",
    alt: "Mapa mostrando pets próximos à localização do usuário",
    headline: "Salve uma vida",
    support: "Adotar é salvar uma vida e ganhar um\namigo para toda a vida!\nFaça a diferença.",
  },
  {
    id: 3,
    src: "/slide-3.png",
    alt: "Checklist de etapas de adoção com gatinho feliz",
    headline: "Adote um Pet",
    support: "Descobra como é fácil encontrar e adotar seu\n novo melhor amigo.\nAlguém está esperando por você!",
  },
]

const SLIDE_DURATION = 6000

interface AuthCarouselProps {
  className?: string
  onComplete?: () => void
}

export function AuthCarousel({ className, onComplete }: AuthCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedRef = useRef(false)

  // Detect prefers-reduced-motion once at mount
  const prefersReduced = useRef(
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current

  const goToNext = () => {
    setActiveIndex((prev) => {
      const next = (prev + 1) % SLIDES.length
      if (!completedRef.current && prev === SLIDES.length - 1) {
        completedRef.current = true
        onComplete?.()
      }
      return next
    })
  }

  const clearCurrentInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (prefersReduced || isPaused) {
      clearCurrentInterval()
      return
    }
    intervalRef.current = setInterval(goToNext, SLIDE_DURATION)
    return clearCurrentInterval
  }, [isPaused, prefersReduced]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border border-white/10 select-none",
        className
      )}
      style={{
        backgroundImage: "url(/background-login-cadastro.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Overlay de contraste */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(0,0,0,0.25) 0%, rgba(59,2,112,0.55) 100%)",
        }}
        aria-hidden
      />

      {/* Slides */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
        {SLIDES.map((slide, i) => {
          const isActive = i === activeIndex
          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 pt-10 pb-20 text-center",
                prefersReduced
                  ? isActive
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                  : cn(
                    "transition-opacity duration-700",
                    isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                  )
              )}
            >
              {/* Imagem do slide */}
              <PublicImage
                src={slide.src}
                alt={slide.alt}
                loading={i === 0 ? "eager" : "lazy"}
                className="w-full max-w-[220px] md:max-w-[320px] max-h-[220px] md:max-h-[280px] h-auto object-contain drop-shadow-xl"
              />

              {/* Headline */}
              <h2 className="text-2xl md:text-3xl font-bold leading-tight text-white whitespace-pre-line">
                {slide.headline}
              </h2>

              {/* Texto de apoio */}
              <p className="max-w-xs text-sm md:text-base text-white/90 leading-relaxed">
                {slide.support}
              </p>
            </div>
          )
        })}
      </div>

      {/* Dots */}
      <div
        className="relative flex items-center justify-center gap-2 pb-8"
        role="tablist"
        aria-label="Slides do carousel"
      >
        {SLIDES.map((slide, i) => (
          <button
            key={slide.id}
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Ir para slide ${i + 1}`}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "rounded-lg transition-all",
              prefersReduced ? "" : "duration-300",
              i === activeIndex
                ? "bg-white h-2 w-6"
                : "bg-white/40 h-2 w-2 hover:bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  )
}
