import { AuthPageHeader } from "@/components/layout/AuthPageHeader"

/**
 * View da Home para usuários do tipo PJ (ONG/Abrigo).
 * Renderizada condicionalmente dentro da HomePage quando userType === 'PJ'.
 */
export function PJHomeView() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <AuthPageHeader
        title="Início"
        subtitle="Visão geral da sua organização"
        showDateFilter
      />

      {/* Área de conteúdo — home PJ completa será implementada em breve */}
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div className="flex flex-col items-center gap-4 max-w-xs">
          <p className="text-sm text-muted-foreground leading-relaxed">
            O painel inicial da sua organização será implementado em breve.
            Por enquanto, use o menu lateral para navegar.
          </p>
        </div>
      </div>
    </div>
  )
}
