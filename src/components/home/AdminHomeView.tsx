import { PJContentPlaceholder } from "@/components/pj/PJContentPlaceholder"

/**
 * View da Home para usuários do tipo ADMIN.
 * Renderizada condicionalmente dentro da HomePage quando userType === 'ADMIN'.
 * Conteúdo completo será implementado em etapa futura.
 */
export function AdminHomeView() {
  return (
    <PJContentPlaceholder
      title="Painel Administrativo"
      description="Gerencie usuários, organizações e configurações da plataforma AdotePet."
    />
  )
}
