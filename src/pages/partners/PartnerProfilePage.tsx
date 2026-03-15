import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { AuthPageHeader } from "@/components/layout/AuthPageHeader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AlertCircle,
  MapPin,
  Phone,
  Globe,
  Instagram,
  MessageCircle,
  Building2,
} from "lucide-react"
import { fetchPartnerBySlug, type PartnerProfile } from "@/lib/actions/partners"
import { getWhatsAppLink } from "@/lib/utils"

// ─── Label helpers ────────────────────────────────────────────────────────────

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

function displayName(partner: PartnerProfile): string {
  return partner.fantasy_name ?? partner.company_name ?? "Parceiro"
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 px-4 pb-12 pt-6 lg:px-8 mx-auto max-w-3xl w-full">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-5 w-32 rounded-lg" />
      </div>
      <Skeleton className="h-px w-full" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

// ─── Error / Not Found ────────────────────────────────────────────────────────

function NotFoundState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-8">
      <div className="mb-4 rounded-full bg-destructive/10 p-5">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h2 className="text-lg font-bold font-sans">Parceiro não encontrado</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground font-sans">
        O perfil deste parceiro não existe ou não está mais disponível.
      </p>
    </div>
  )
}

// ─── Contact Button ───────────────────────────────────────────────────────────

function ContactButton({
  href,
  icon: Icon,
  label,
  ariaLabel,
}: {
  href: string
  icon: React.ElementType
  label: string
  ariaLabel: string
}) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-10 rounded-lg font-sans gap-2 flex-1"
    >
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        {label}
      </a>
    </Button>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PartnerProfilePage() {
  const { slug } = useParams<{ slug: string }>()
  const [partner, setPartner] = useState<PartnerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) {
      setNotFound(true)
      setLoading(false)
      return
    }
    fetchPartnerBySlug(slug).then(({ data }) => {
      if (!data) setNotFound(true)
      else setPartner(data)
      setLoading(false)
    })
  }, [slug])

  const name = partner ? displayName(partner) : "Parceiro"

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50">
      <AuthPageHeader
        title={name}
        subtitle={partner ? displayOrgType(partner.org_type) : ""}
      />

      {loading ? (
        <ScrollArea className="flex-1">
          <ProfileSkeleton />
        </ScrollArea>
      ) : notFound || !partner ? (
        <NotFoundState />
      ) : (
        <ScrollArea className="flex-1 pb-12">
          <div className="mx-auto max-w-3xl w-full pt-6 px-4 lg:px-8 pb-12 flex flex-col gap-6">

            {/* Capa */}
            {partner.cover_image_url ? (
              <div className="h-48 w-full overflow-hidden rounded-2xl border border-border bg-muted">
                <img
                  src={partner.cover_image_url}
                  alt={`Capa de ${name}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-primary/5">
                <Building2 className="h-16 w-16 text-primary/30" />
              </div>
            )}

            {/* Identity card */}
            <Card className="rounded-2xl border-border shadow-sm bg-white overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-muted">
                    {partner.logo_image_url ? (
                      <img
                        src={partner.logo_image_url}
                        alt={`Logo de ${name}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Building2 className="h-7 w-7 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Name + category */}
                  <div className="flex flex-col gap-2 min-w-0">
                    <h1 className="text-xl font-bold font-sans text-foreground leading-tight">
                      {name}
                    </h1>
                    <Badge variant="outline" className="w-fit h-6 rounded-lg font-sans text-xs px-2">
                      {displayOrgType(partner.org_type)}
                    </Badge>
                    {(partner.city || partner.state) && (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        {[partner.city, partner.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Headline */}
                {partner.headline && (
                  <p className="mt-4 text-sm font-sans text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-3">
                    {partner.headline}
                  </p>
                )}

                {/* Contact buttons */}
                {(() => {
                  const whatsappLink = getWhatsAppLink(partner.whatsapp)
                  const showContact = whatsappLink || partner.phone || partner.website || partner.instagram

                  if (!showContact) return null

                  return (
                    <>
                      <Separator className="my-5" />
                      <div className="flex flex-wrap gap-2">
                        {whatsappLink && (
                          <ContactButton
                            href={whatsappLink}
                            icon={MessageCircle}
                            label="WhatsApp"
                            ariaLabel={`Abrir WhatsApp de ${name}`}
                          />
                        )}
                      {partner.phone && !partner.whatsapp && (
                        <ContactButton
                          href={`tel:${partner.phone}`}
                          icon={Phone}
                          label="Ligar"
                          ariaLabel={`Ligar para ${name}`}
                        />
                      )}
                      {partner.instagram && (
                        <ContactButton
                          href={`https://instagram.com/${partner.instagram.replace(/^@/, "")}`}
                          icon={Instagram}
                          label="Instagram"
                          ariaLabel={`Ver Instagram de ${name}`}
                        />
                      )}
                      {partner.website && (
                        <ContactButton
                          href={partner.website}
                          icon={Globe}
                          label="Site"
                          ariaLabel={`Visitar site de ${name}`}
                        />
                      )}
                    </div>
                  </>
                )
              })()}
              </CardContent>
            </Card>

            {/* Description */}
            {partner.description && (
              <Card className="rounded-2xl border-border shadow-sm bg-white overflow-hidden">
                <CardContent className="p-6 md:p-8 flex flex-col gap-3">
                  <h2 className="text-base font-bold font-sans text-foreground">Sobre nós</h2>
                  <p className="text-sm font-sans text-muted-foreground leading-relaxed whitespace-pre-line">
                    {partner.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {Array.isArray(partner.services) && partner.services.length > 0 && (
              <Card className="rounded-2xl border-border shadow-sm bg-white overflow-hidden">
                <CardContent className="p-6 md:p-8 flex flex-col gap-3">
                  <h2 className="text-base font-bold font-sans text-foreground">Serviços</h2>
                  <div className="flex flex-wrap gap-2">
                    {partner.services.map((service: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-lg bg-primary/8 px-3 py-1.5 font-sans text-xs font-medium text-primary"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
