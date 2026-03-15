import { useEffect, useState, useRef } from "react"
import Autoplay from "embla-carousel-autoplay"
import { ExternalLink } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchActiveBanners, type PartnerBanner } from "@/lib/actions/banners"

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function BannerSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[480px] md:max-w-full">
      <Skeleton className="h-[168px] w-full rounded-2xl" />
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function BannerEmpty() {
  return null // Silencioso: se não há banners, o bloco simplesmente não aparece
}

// ─── Error State ──────────────────────────────────────────────────────────────

function BannerError() {
  return null // Silencioso: se erro, o bloco simplesmente não aparece
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Carrossel de banners publicitários para a Home PF pública.
 *
 * - Autoplay a cada 5s, pausa em interação manual
 * - Botões anterior/próximo e bolinhas indicadoras
 * - Clique no banner abre o link em nova aba
 * - Estados: loading (skeleton), empty (oculto), error (oculto)
 * - Responsivo: até 768px centralizado com max-w-[480px]; altura 168px
 * - Radius 16px no container; imagens com object-cover + lazy-load
 */
export function PartnerBannerCarousel() {
  const [banners, setBanners] = useState<PartnerBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  useEffect(() => {
    fetchActiveBanners().then(({ data, error }) => {
      if (error) setHasError(true)
      else setBanners(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <BannerSkeleton />
  if (hasError) return <BannerError />
  if (banners.length === 0) return <BannerEmpty />

  return (
    <div className="mx-auto w-full max-w-[480px] md:max-w-full" aria-label="Banners de parceiros">
      <Carousel
        opts={{ loop: true }}
        plugins={[plugin.current]}
        className="w-full"
        onMouseEnter={plugin.current.stop}
        onMouseLeave={plugin.current.reset}
        setApi={(api) => {
          api?.on("select", () => {
            setSelectedIndex(api.selectedScrollSnap())
          })
        }}
      >
        {/* Track */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-muted">
          <CarouselContent>
            {banners.map((banner, idx) => {
              const imgSrc = banner.image_url
              const handleClick = () => {
                if (banner.link_url) {
                  window.open(banner.link_url, "_blank", "noopener,noreferrer")
                }
              }

              return (
                <CarouselItem key={banner.id}>
                  <div
                    className="relative h-[168px] w-full"
                    role={banner.link_url ? "link" : undefined}
                    aria-label={banner.title ?? `Banner ${idx + 1}`}
                    onClick={handleClick}
                    style={{ cursor: banner.link_url ? "pointer" : "default" }}
                  >
                    <img
                      src={imgSrc}
                      alt={banner.title ?? `Banner ${idx + 1}`}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                    {/* CTA overlay */}
                    {banner.link_url && (
                      <div className="absolute right-3 top-3">
                        <span className="inline-flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold font-sans text-foreground backdrop-blur-sm shadow-sm">
                          <ExternalLink className="h-3 w-3" />
                          {banner.cta_label ?? "Saiba mais"}
                        </span>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>

          {/* Prev / Next */}
          {banners.length > 1 && (
            <>
              <CarouselPrevious
                className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-transparent bg-white/70 hover:bg-white text-primary shadow-sm backdrop-blur-sm transition-all"
                aria-label="Banner anterior"
              />
              <CarouselNext
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-transparent bg-white/70 hover:bg-white text-primary shadow-sm backdrop-blur-sm transition-all"
                aria-label="Próximo banner"
              />
            </>
          )}
        </div>

        {/* Dot indicators */}
        {banners.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" role="tablist" aria-label="Indicadores de banner">
            {banners.map((_, idx) => (
              <span
                key={idx}
                role="tab"
                aria-selected={idx === selectedIndex}
                aria-label={`Banner ${idx + 1}`}
                className={[
                  "h-2 rounded-full transition-all duration-300",
                  idx === selectedIndex
                    ? "w-5 bg-primary"
                    : "w-2 bg-muted-foreground/30",
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </Carousel>
    </div>
  )
}
