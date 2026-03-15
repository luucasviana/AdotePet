import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { AuthPageHeader } from "@/components/layout/AuthPageHeader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { AlertCircle, Building2 } from "lucide-react"
import { PartnerCard } from "@/components/partners/PartnerCard"
import { fetchPublishedPartners, type PublishedPartner } from "@/lib/actions/partners"

// ─── Label map ───────────────────────────────────────────────────────────────

const ORG_TYPE_LABELS: Record<string, string> = {
  ong:        "ONGs",
  shelter:    "Abrigos",
  pet_shop:   "Pet Shops",
  veterinary: "Clínicas Veterinárias",
  trainer:    "Adestradores",
  grooming:   "Banho e Tosa",
  other:      "Outros Parceiros",
}

function getCategoryLabel(orgType?: string): string {
  if (!orgType) return "Parceiros"
  return ORG_TYPE_LABELS[orgType] ?? orgType
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-56 w-full rounded-2xl" />
      ))}
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ categoria }: { categoria?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-muted p-5">
        <Building2 className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold font-sans text-foreground">
        {categoria ? `Nenhum parceiro em "${getCategoryLabel(categoria)}"` : "Nenhum parceiro encontrado"}
      </h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground font-sans">
        Ainda não há parceiros publicados nesta categoria. Volte em breve!
      </p>
    </div>
  )
}

// ─── Error State ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 rounded-full bg-destructive/10 p-5">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-lg font-bold font-sans text-foreground">Erro ao carregar parceiros</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground font-sans">
        Verifique sua conexão e tente novamente.
      </p>
      <Button variant="outline" onClick={onRetry} className="mt-6 h-10 rounded-lg font-sans">
        Tentar novamente
      </Button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PartnersCategoryPage() {
  const { categoria } = useParams<{ categoria: string }>()
  const [partners, setPartners] = useState<PublishedPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const label = getCategoryLabel(categoria)

  const load = async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await fetchPublishedPartners(categoria)
    if (err) setError(err)
    setPartners(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [categoria])

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50">
      <AuthPageHeader
        title={label}
        subtitle={`Parceiros parceiros do ecossistema pet — ${label}`}
      />

      <ScrollArea className="flex-1 px-4 pb-12 lg:px-8">
        <div className="mx-auto max-w-7xl w-full pt-6 flex flex-col gap-6">

          {loading ? (
            <GridSkeleton />
          ) : error ? (
            <ErrorState onRetry={load} />
          ) : partners.length === 0 ? (
            <EmptyState categoria={categoria} />
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-sans">
                <span className="font-medium text-foreground">{partners.length}</span>{" "}
                {partners.length === 1 ? "parceiro encontrado" : "parceiros encontrados"}
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {partners.map((partner) => (
                  <PartnerCard key={partner.id} partner={partner} />
                ))}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
