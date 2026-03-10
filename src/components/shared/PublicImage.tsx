import { useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface PublicImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  loading?: "lazy" | "eager"
}

/**
 * Resilient <img> wrapper for assets in /public.
 * On error: swaps to fallbackSrc if provided; otherwise hides the element
 * without collapsing the surrounding layout.
 */
export function PublicImage({
  src,
  alt,
  className,
  fallbackSrc,
  loading = "lazy",
}: PublicImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const hasFailed = useRef(false)

  const handleError = () => {
    if (hasFailed.current) return
    hasFailed.current = true

    if (fallbackSrc) {
      setCurrentSrc(fallbackSrc)
    } else {
      // Hide but keep space so layout doesn't collapse
      setCurrentSrc("")
    }
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      onError={handleError}
      className={cn(className, !currentSrc && "invisible")}
    />
  )
}
