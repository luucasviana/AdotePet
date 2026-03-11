import { AuthPageHeader } from "@/components/layout/AuthPageHeader"

export function PJAdocoesPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <AuthPageHeader
        title="Adoções"
        subtitle="Acompanhe e gerencie os processos de adoção"
        showDateFilter
      />

      {/* Área de conteúdo — módulo de adoções será implementado em breve */}
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div className="flex flex-col items-center gap-4 max-w-xs">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Acompanhe e gerencie os processos de adoção dos pets da sua organização.
          </p>
        </div>
      </div>
    </div>
  )
}
