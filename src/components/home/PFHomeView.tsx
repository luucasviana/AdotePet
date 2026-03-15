import { Loader2 } from "lucide-react"
import { AuthPageHeader } from "@/components/layout/AuthPageHeader"
import { ScrollArea } from "@/components/ui/scroll-area"
import { usePFSegmentation } from "@/hooks/usePFSegmentation"
import { PartnerBannerCarousel } from "@/components/pf/home/PartnerBannerCarousel"
import { QuickActionsSection } from "@/components/pf/home/QuickActionsSection"
import { PartnerCategoryGrid } from "@/components/pf/home/PartnerCategoryGrid"

/**
 * View da Home para PF sem vínculo com PJ.
 *
 * Segmentação:
 * - PF comum (sem vínculo PJ) → mostra os 3 blocos
 * - PF vinculada a PJ → mensagem informativa
 *
 * Blocos:
 * 1. PartnerBannerCarousel — banners publicitários
 * 2. QuickActionsSection   — Cadastrar pet / Quero adotar
 * 3. PartnerCategoryGrid   — parceiros do ecossistema
 */
export function PFHomeView() {
  const { isLinkedToPJ, loading } = usePFSegmentation()

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50">
      <AuthPageHeader
        title="Início"
        subtitle="Bem-vindo ao AdotePet"
      />

      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl w-full px-8 pb-12 pt-6">
          {loading ? (
            /* Loading da segmentação — brevíssimo */
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Carregando" />
            </div>
          ) : isLinkedToPJ ? (
            /* PF vinculada a PJ: não deve usar esta home pública */
            <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <span className="text-3xl" aria-hidden="true">🏢</span>
              </div>
              <div className="flex flex-col gap-2 max-w-xs">
                <h2 className="text-base font-bold font-sans text-foreground">
                  Você faz parte de uma equipe
                </h2>
                <p className="text-sm font-sans text-muted-foreground leading-relaxed">
                  Sua conta está vinculada a uma organização. Acesse o sistema pelo perfil da organização para gerenciar pets e adoções.
                </p>
              </div>
            </div>
          ) : (
            /* PF comum: 3 blocos da home pública */
            <div className="flex flex-col gap-8">
              {/* Bloco 1: Banners publicitários */}
              <PartnerBannerCarousel />

              {/* Bloco 2: Ações rápidas */}
              <QuickActionsSection />

              {/* Bloco 3: Parceiros por categoria */}
              <PartnerCategoryGrid />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
