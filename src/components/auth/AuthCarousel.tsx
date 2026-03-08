import { useEffect, useRef, useState } from "react"
import { Dog, Heart, PawPrint } from "lucide-react"
import { cn } from "@/lib/utils"

const SLIDES = [
  {
    id: 1,
    icon: PawPrint,
    title: "Adoção com segurança e transparência.",
    description: "Cada animal tem histórico completo, vacinas e situação atualizada para você adotar com confiança.",
    gradient: "from-[#3B0270] via-[#5c03b0] to-[#7b3fc4]",
    accentColor: "#c084fc",
  },
  {
    id: 2,
    icon: Dog,
    title: "Encontre pets perto de você em poucos cliques.",
    description: "Filtre por distância, espécie, porte e muito mais. O pet ideal pode estar a poucos quilômetros.",
    gradient: "from-[#2d0154] via-[#4a0290] to-[#6b21a8]",
    accentColor: "#e879f9",
  },
  {
    id: 3,
    icon: Heart,
    title: "ONGs e abrigos parceiros verificados.",
    description: "Todos os parceiros PassportPet passam por verificação. Você sabe exatamente de onde vem seu pet.",
    gradient: "from-[#3B0270] via-[#6d28d9] to-[#7c3aed]",
    accentColor: "#a78bfa",
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
  const [prefersReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )

  const goToNext = () => {
    setActiveIndex((prev) => {
      const next = (prev + 1) % SLIDES.length
      // fire onComplete once after cycling through all slides
      if (!completedRef.current && prev === SLIDES.length - 1) {
        completedRef.current = true
        onComplete?.()
      }
      return next
    })
  }

  const startInterval = () => {
    if (prefersReduced) return
    intervalRef.current = setInterval(goToNext, SLIDE_DURATION)
  }

  const clearCurrentInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    if (!isPaused) {
      startInterval()
    }
    return clearCurrentInterval
  }, [isPaused]) // eslint-disable-line react-hooks/exhaustive-deps

  const slide = SLIDES[activeIndex]
  const IconComponent = slide.icon

  return (
    <div
      className={cn("relative flex flex-col items-center justify-between overflow-hidden rounded-2xl select-none", className)}
      style={{ background: `linear-gradient(135deg, #3B0270 0%, #5c03b0 50%, #7b3fc4 100%)` }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Slides container */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-8 py-12 text-center">
        {SLIDES.map((s, i) => {
          const Icon = s.icon
          const isActive = i === activeIndex
          return (
            <div
              key={s.id}
              aria-hidden={!isActive}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center px-8 py-12 text-center",
                prefersReduced
                  ? isActive ? "opacity-100" : "opacity-0"
                  : "transition-opacity duration-700",
                !prefersReduced && (isActive ? "opacity-100" : "opacity-0")
              )}
            >
              {/* Icon illustration */}
              <div
                className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
              >
                <Icon className="h-12 w-12 text-white" strokeWidth={1.5} />
              </div>

              <h2 className="mb-4 text-2xl font-bold leading-tight text-white">
                {s.title}
              </h2>
              <p className="max-w-xs text-base text-white/75 leading-relaxed">
                {s.description}
              </p>
            </div>
          )
        })}

        {/* Static icon for reduced motion */}
        {prefersReduced && (
          <div className="flex flex-col items-center justify-center">
            <div
              className="mb-8 flex h-24 w-24 items-center justify-center rounded-2xl"
              style={{ background: "rgba(255,255,255,0.12)" }}
            >
              <IconComponent className="h-12 w-12 text-white" strokeWidth={1.5} />
            </div>
            <h2 className="mb-4 text-2xl font-bold leading-tight text-white">{slide.title}</h2>
            <p className="max-w-xs text-base text-white/75 leading-relaxed">{slide.description}</p>
          </div>
        )}
      </div>

      {/* Dot indicators */}
      <div className="relative flex items-center gap-2 pb-8" role="tablist" aria-label="Slides do carousel">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "rounded-full transition-all duration-300",
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
