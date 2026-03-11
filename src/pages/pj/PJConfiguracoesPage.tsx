import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PJContentPlaceholder } from "@/components/pj/PJContentPlaceholder"

/**
 * Página de Configurações da área PJ.
 * Estruturada com duas abas:
 * - Perfil da organização
 * - Estrutura e capacidade
 * O conteúdo das abas será implementado futuramente.
 */
export function PJConfiguracoesPage() {
  return (
    <div className="flex flex-col flex-1 h-full p-8 gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie as informações e configurações da sua organização.
        </p>
      </div>

      <Tabs defaultValue="perfil" className="flex flex-col flex-1">
        <TabsList className="w-fit rounded-lg h-10">
          <TabsTrigger value="perfil" className="rounded-lg text-sm font-semibold">
            Perfil da organização
          </TabsTrigger>
          <TabsTrigger value="estrutura" className="rounded-lg text-sm font-semibold">
            Estrutura e capacidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="flex flex-1">
          <PJContentPlaceholder
            title="Perfil da organização"
            description="Edite nome, logo, contato e informações públicas da sua organização."
          />
        </TabsContent>

        <TabsContent value="estrutura" className="flex flex-1">
          <PJContentPlaceholder
            title="Estrutura e capacidade"
            description="Informe o porte do abrigo, capacidade de animais e estrutura disponível."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
