import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Building2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPartnerCategories, type PartnerCategory } from "@/lib/actions/partners"

// ─── Label map for known org_types ───────────────────────────────────────────

const ORG_TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  ong:           { label: "ONGs",                emoji: "🏠" },
  shelter:       { label: "Abrigos",             emoji: "🏡" },
  pet_shop:      { label: "Pet Shops",           emoji: "🛍️" },
  veterinary:    { label: "Clínicas Vet.",       emoji: "🩺" },
  trainer:       { label: "Adestradores",        emoji: "🐾" },
  grooming:      { label: "Banho e Tosa",        emoji: "✂️" },
  other:         { label: "Outros",              emoji: "📍" },
}

function getCategoryLabel(orgType: string): { label: string; emoji: string } {
  return ORG_TYPE_LABELS[orgType] ?? { label: orgType, emoji: "📍" }
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CategoryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-2xl" />
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Grid de categorias de parceiros, derivadas dos org_type em partner_public_profiles.
 * Cada categoria clicável navega para /home/parceiros/:categoria.
 * Se nenhum parceiro publicado existir, o bloco fica oculto.
 */
export function PartnerCategoryGrid() {
  const [categories, setCategories] = useState<PartnerCategory[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPartnerCategories().then(({ data }) => {
      setCategories(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <section aria-label="Categorias de parceiros">
        <h2 className="mb-4 text-base font-bold font-sans text-foreground">
          Parceiros do ecossistema pet
        </h2>
        <CategoryGridSkeleton />
      </section>
    )
  }

  if (categories.length === 0) return null // Oculto quando não há parceiros

  return (
    <section aria-label="Categorias de parceiros">
      <h2 className="mb-4 text-base font-bold font-sans text-foreground">
        Parceiros do ecossistema pet
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map(({ org_type, count }) => {
          const { label, emoji } = getCategoryLabel(org_type)
          return (
            <button
              key={org_type}
              onClick={() => navigate(`/home/parceiros/${org_type}`)}
              aria-label={`Ver parceiros de ${label}`}
              className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 text-center"
            >
              <span className="text-2xl" aria-hidden="true">{emoji}</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold font-sans text-foreground leading-tight group-hover:text-primary transition-colors">
                  {label}
                </span>
                <span className="text-xs font-sans text-muted-foreground">
                  {count} {count === 1 ? "parceiro" : "parceiros"}
                </span>
              </div>
            </button>
          )
        })}

        {/* Card de "Ver todos os parceiros" */}
        <button
          onClick={() => navigate("/home/parceiros")}
          aria-label="Ver todos os parceiros"
          className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-slate-50 p-4 transition-all hover:border-primary/30 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 text-center"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Building2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm font-bold font-sans text-muted-foreground group-hover:text-primary transition-colors leading-tight">
            Ver todos
          </span>
        </button>
      </div>
    </section>
  )
}
