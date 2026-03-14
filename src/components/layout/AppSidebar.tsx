import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { LogOut, Plus, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/context/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { NAV_CONFIG } from "@/lib/nav-config"
import { SidebarNavItem } from "@/components/pj/sidebar/SidebarNavItem"
import { OrgIdentity } from "@/components/pj/sidebar/OrgIdentity"
import { UserIdentity } from "@/components/layout/UserIdentity"
import type { OrgType } from "@/components/pj/sidebar/OrgIdentity"
import { cn } from "@/lib/utils"

/**
 * Sidebar única e reutilizável para toda a área autenticada.
 *
 * Adapta-se ao tipo de usuário (PF | PJ | ADMIN):
 * - Topo: identidade da organização (PJ) ou identidade pessoal (PF/ADMIN)
 * - Nav principal: itens configurados em NAV_CONFIG[userType]
 * - Rodapé: itens de configuração + botão Sair
 */
export function AppSidebar() {
  const { user, signOut } = useAuth()
  const { userType } = useProfile()
  const navigate = useNavigate()
  
  // Estado para controlar se a sidebar está recolhida ou expandida
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success("Até logo! Você saiu da sua conta.")
    navigate("/login")
  }

  const navSection = NAV_CONFIG[userType]

  // ── Derivar dados de identidade do user_metadata ──────────────────────
  const orgName: string =
    user?.user_metadata?.nome_fantasia ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Minha Organização"

  const orgType: OrgType =
    user?.user_metadata?.tipo_conta === "abrigo" ? "Abrigo" : "ONG"

  const displayName: string =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.nome ||
    user?.email?.split("@")[0] ||
    "Usuário"

  const logoUrl: string | undefined = user?.user_metadata?.logo_url
  const avatarUrl: string | undefined = user?.user_metadata?.avatar_url

  // ── Subtítulo Admin ───────────────────────────────────────────────────
  const adminSubtitle = "Administrador"

  return (
    <TooltipProvider>
      <aside
        aria-label="Navegação principal"
        className={cn(
          "hidden md:flex h-screen shrink-0 flex-col border-r border-border bg-white transition-all duration-300 ease-in-out relative group",
          isCollapsed ? "w-[80px]" : "w-64"
        )}
      >
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-border bg-white text-muted-foreground shadow-sm hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#3B0270]/50 transition-all",
            isCollapsed && "right-[-12px]" // Ajuste delicado de posição quando fechado
          )}
          aria-label={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-3.5 w-3.5" />
          ) : (
            <PanelLeftClose className="h-3.5 w-3.5" />
          )}
        </Button>

        {/* ── 1. Topo: identidade do usuário ── */}
        <div className="shrink-0 border-b border-border min-h-[73px] flex items-center">
          {userType === "PJ" ? (
            <OrgIdentity orgName={orgName} orgType={orgType} logoUrl={logoUrl} isCollapsed={isCollapsed} />
          ) : userType === "ADMIN" ? (
            <UserIdentity displayName={displayName} avatarUrl={avatarUrl} subtitle={adminSubtitle} isCollapsed={isCollapsed} />
          ) : (
            <UserIdentity displayName={displayName} avatarUrl={avatarUrl} isCollapsed={isCollapsed} />
          )}
        </div>

        {/* ── 2. Nav principal ── */}
        <ScrollArea className="flex-1 overflow-x-hidden">
          <div className={cn("flex flex-col gap-1 py-4 w-full", isCollapsed ? "px-2 items-center" : "px-3")}>
            {/* CTA "+ Cadastrar pet" exclusivo da PJ */}
            {userType === "PJ" && (
              <div className="mb-2 w-full flex justify-center">
                {isCollapsed ? (
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        className="w-10 h-10 p-0 rounded-lg bg-[#3B0270] text-white hover:bg-[#3B0270]/90 focus-visible:ring-2 focus-visible:ring-[#3B0270]/50 shadow-sm transition-all duration-150 flex items-center justify-center shrink-0"
                        aria-label="Cadastrar novo pet"
                      >
                        <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-semibold" sideOffset={16}>Cadastrar pet</TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    className="w-full h-10 rounded-lg gap-2 bg-[#3B0270] text-white font-bold hover:bg-[#3B0270]/90 focus-visible:ring-2 focus-visible:ring-[#3B0270]/50 focus-visible:ring-offset-1 shadow-sm transition-all duration-150 overflow-hidden"
                    aria-label="Cadastrar novo pet"
                  >
                    <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="whitespace-nowrap">Cadastrar pet</span>
                  </Button>
                )}
              </div>
            )}

            <nav aria-label="Menu principal" className={cn("w-full flex flex-col", isCollapsed ? "items-center" : "")}>
              {navSection.main.map((item) => (
                <SidebarNavItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  end={item.end}
                  isCollapsed={isCollapsed}
                />
              ))}
            </nav>
          </div>
        </ScrollArea>

        {/* ── 3. Rodapé: configurações + sair ── */}
        <div className="shrink-0 border-t border-border">
          <div className={cn("flex flex-col gap-1 py-4 w-full", isCollapsed ? "px-2 items-center" : "px-3")}>
            {navSection.footer.map((item) => (
              <SidebarNavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isCollapsed={isCollapsed}
              />
            ))}

            <Separator className={cn("my-1", isCollapsed ? "w-8" : "w-full")} />

            {isCollapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleSignOut}
                    aria-label="Sair da conta"
                    className="flex items-center justify-center shrink-0 rounded-lg h-10 w-10 p-0 text-muted-foreground transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                  >
                    <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-semibold text-red-600" sideOffset={16}>Sair</TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={handleSignOut}
                aria-label="Sair da conta"
                className="flex items-center gap-3 rounded-lg px-3 h-10 min-h-10 w-full text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-1 overflow-hidden"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-nowrap">Sair</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
