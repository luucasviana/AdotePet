import { PJContentPlaceholder } from "@/components/pj/PJContentPlaceholder"

/**
 * View da Home para usuários do tipo PF (Pessoa Física / Adotante).
 * Renderizada condicionalmente dentro da HomePage quando userType === 'PF'.
 * Conteúdo completo será implementado em etapa futura.
 */
export function PFHomeView() {
  return (
    <PJContentPlaceholder
      title="Bem-vindo ao AdotePet!"
      description="Encontre seu novo melhor amigo. O seu painel de adoções será implementado em breve."
    />
  )
}
