import { useNavigate } from "react-router-dom"
import { MapPin, ArrowRight, Building2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { PublishedPartner } from "@/lib/actions/partners"

// ─── Category label helpers ───────────────────────────────────────────────────

const ORG_TYPE_LABELS: Record<string, string> = {
  ong:        "ONG",
  shelter:    "Abrigo",
  pet_shop:   "Pet Shop",
  veterinary: "Clínica Veterinária",
  trainer:    "Adestrador",
  grooming:   "Banho e Tosa",
  other:      "Outros",
}

function displayOrgType(orgType: string | null): string {
  if (!orgType) return "Parceiro"
  return ORG_TYPE_LABELS[orgType] ?? orgType
}

function displayName(partner: PublishedPartner): string {
  return partner.fantasy_name ?? partner.company_name ?? "Parceiro"
}

// ─── PartnerCard ──────────────────────────────────────────────────────────────

export interface PartnerCardProps {
  partner: PublishedPartner
}

/**
 * Card de parceiro reutilizável.
 * Exibe logo, nome, categoria, localização, descrição curta e botão "Ver perfil".
 * Usa shadcn Card. Acessível com alt text e aria-label.
 */
export function PartnerCard({ partner }: PartnerCardProps) {
  const navigate = useNavigate()
  const name = displayName(partner)
  const orgTypeLabel = displayOrgType(partner.org_type)
  const location = [partner.city, partner.state].filter(Boolean).join(", ")
  const services = Array.isArray(partner.services)
    ? partner.services.slice(0, 3)
    : []

  const placeholderLogo = `https://placehold.co/80x80/f1f5f9/94a3b8?text=${encodeURIComponent(name[0] ?? "P")}`
  const logoSrc = partner.logo_image_url || placeholderLogo

  const handleViewProfile = () => navigate(`/home/parceiros/perfil/${partner.slug}`)

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Header with logo */}
      <CardContent className="flex flex-1 flex-col p-4 gap-3">
        <div className="flex items-start gap-3">
          {/* Logo */}
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
            <img
              src={logoSrc}
              alt={`Logo de ${name}`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).src = placeholderLogo
              }}
            />
          </div>

          {/* Name + category */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-sans text-sm font-bold leading-tight text-foreground">
              {name}
            </h3>
            <Badge
              variant="outline"
              className="mt-1 h-5 rounded-lg font-sans text-[11px] px-2"
            >
              {orgTypeLabel}
            </Badge>
          </div>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5 font-sans text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Description */}
        {partner.headline ? (
          <p className="font-sans text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {partner.headline}
          </p>
        ) : partner.description ? (
          <p className="font-sans text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {partner.description}
          </p>
        ) : null}

        {/* Services */}
        {services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {services.map((service, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-lg bg-muted/60 px-2 py-0.5 font-sans text-[11px] text-muted-foreground"
              >
                {service}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="shrink-0 p-4 pt-0">
        <Button
          onClick={handleViewProfile}
          variant="outline"
          className="h-10 w-full rounded-lg font-sans text-xs font-semibold border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/30 gap-1.5"
          aria-label={`Ver perfil de ${name}`}
        >
          <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
          Ver perfil
          <ArrowRight className="h-3.5 w-3.5 ml-auto" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  )
}
