import { AuthPageHeader } from "@/components/layout/AuthPageHeader"

export function PJPetsPage() {
  return (
    <div className="flex flex-1 flex-col h-full">
      <AuthPageHeader
        title="Meus pets"
        subtitle="Gerencie os pets cadastrados pela sua organização"
        showDateFilter
      />

      {/* Área de conteúdo — listagem de pets será implementada em breve */}
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <div className="flex flex-col items-center gap-4 max-w-xs">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Aqui você gerencia todos os pets cadastrados pela sua organização.
          </p>
        </div>
      </div>
    </div>
  )
}
