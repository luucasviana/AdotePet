import type { ReactNode } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { DatePeriodFilter, type DateFilterValue } from "@/components/layout/DatePeriodFilter"

interface AuthPageHeaderProps {
  /** Título principal da página */
  title: string
  /** Subtítulo ou descrição opcional */
  subtitle?: string
  /** Mostrar filtro de período de data à direita */
  showDateFilter?: boolean
  /** Período padrão do filtro */
  defaultPeriod?: DateFilterValue
  /** Callback quando o período muda */
  onPeriodChange?: (period: DateFilterValue) => void
  /** Ações extras à direita (botões, etc.) — renderizados antes do filtro */
  actions?: ReactNode
}

/**
 * Cabeçalho padronizado para todas as páginas da área autenticada.
 *
 * Layout:
 * - Desktop: título à esquerda, [actions] + [filtro de data] à direita
 * - Mobile: título em cima, filtro abaixo (stack vertical)
 *
 * Uso:
 * ```tsx
 * <AuthPageHeader title="Início" showDateFilter />
 * <AuthPageHeader title="Meus pets" showDateFilter onPeriodChange={setPeriod} />
 * <AuthPageHeader title="Relatórios" actions={<Button>Exportar</Button>} />
 * ```
 */
export function AuthPageHeader({
  title,
  subtitle,
  showDateFilter = false,
  defaultPeriod,
  onPeriodChange,
  actions,
}: AuthPageHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const isHome = location.pathname === "/home" || location.pathname === "/home/"

  return (
    <div className="w-full">
      {/* ── Header principal ──
           Desktop: h-[72px] = py-4 (16) + h-10 avatar (40) + py-4 (16) → same as OrgIdentity
           Mobile : natural stacked layout with py-4                                               */}
      <div className="flex flex-col gap-3 px-8 py-4 md:h-[72px] md:flex-row md:items-center md:justify-between md:gap-4 md:py-0">

        {/* Esquerda: Botão Voltar (se não for Home) + título + subtítulo */}
        <div className="flex items-center gap-4 min-w-0">
          {!isHome && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 shrink-0 rounded-lg border-transparent bg-slate-100 hover:bg-slate-200 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Voltar"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}

          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-xl font-bold leading-tight text-foreground tracking-tight truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground leading-snug truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Direita: ações extras e filtro de data */}
        {(actions || showDateFilter) && (
          <div className="flex shrink-0 items-center gap-3">
            {actions}
            {showDateFilter && (
              <DatePeriodFilter
                defaultValue={defaultPeriod}
                onChange={onPeriodChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Separador horizontal */}
      <Separator />
    </div>
  )
}
