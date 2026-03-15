import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "sonner"
import { LogOut, Plus, PanelLeftClose, PanelLeftOpen, MoreVertical, Settings } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  const { userType, profile } = useProfile()
  const navigate = useNavigate()

  // Estado para controlar se a sidebar está recolhida ou expandida
  const [isCollapsed, setIsCollapsed] = useState(false)
  // Estado para controlar a abertura/fechamento do menu da conta
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success("Até logo! Você saiu da sua conta.")
    navigate("/login")
  }

  const navSection = NAV_CONFIG[userType]

  // ── Derivar dados de identidade ─────────────────────────────────────────
  // Para PJ: priorizar dados da tabela profiles (logo e nome atualizados)
  // Para PF/ADMIN: usar nome do user_metadata (auth)
  const orgName: string =
    profile?.fantasy_name ||
    profile?.company_name ||
    user?.user_metadata?.nome_fantasia ||
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Minha Organização"

  const orgType: OrgType =
    (profile?.org_type as OrgType) ||
    (user?.user_metadata?.tipo_conta === "abrigo" ? "Abrigo" : "ONG")

  const displayName: string =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.nome ||
    user?.email?.split("@")[0] ||
    "Usuário"

  // logo_url vem da tabela profiles (atualizado ao salvar configurações)
  const logoUrl: string | undefined = profile?.logo_url || undefined
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

        {/* ── 1. Topo: Logo AdotePet ── */}
        <div className={cn("shrink-0 border-b border-border min-h-[73px] flex items-center justify-center", isCollapsed ? "px-0" : "px-5")}>
          <img 
            src={isCollapsed ? "/logo%20recolhida.png" : "/logo%20principal.png"} 
            alt="AdotePet"
            className={cn("object-contain", isCollapsed ? "w-full max-w-[40px] h-auto" : "h-9 w-auto")} 
          />
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
                        asChild
                        className="w-10 h-10 p-0 rounded-lg bg-[#3B0270] text-white hover:bg-[#3B0270]/90 focus-visible:ring-2 focus-visible:ring-[#3B0270]/50 shadow-sm transition-all duration-150 flex items-center justify-center shrink-0"
                        aria-label="Cadastrar novo pet"
                      >
                        <Link to="/home/pets/novo">
                          <Plus className="h-5 w-5 shrink-0" aria-hidden="true" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="font-semibold" sideOffset={16}>Cadastrar pet</TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    asChild
                    className="w-full h-10 rounded-lg gap-2 bg-[#3B0270] text-white font-bold hover:bg-[#3B0270]/90 focus-visible:ring-2 focus-visible:ring-[#3B0270]/50 focus-visible:ring-offset-1 shadow-sm transition-all duration-150 overflow-hidden"
                    aria-label="Cadastrar novo pet"
                  >
                    <Link to="/home/pets/novo">
                      <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="whitespace-nowrap">Cadastrar pet</span>
                    </Link>
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

        {/* ── 3. Rodapé: conta + sair ── */}
        <div className="shrink-0 border-t border-border mt-auto">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "w-full relative flex items-center transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-slate-50",
                  isCollapsed ? "justify-center" : ""
                )}
                aria-label="Abrir menu da conta"
              >
                {userType === "PJ" ? (
                  <OrgIdentity orgName={orgName} orgType={orgType} logoUrl={logoUrl} isCollapsed={isCollapsed} />
                ) : userType === "ADMIN" ? (
                  <UserIdentity displayName={displayName} avatarUrl={avatarUrl} subtitle={adminSubtitle} isCollapsed={isCollapsed} />
                ) : (
                  <UserIdentity displayName={displayName} avatarUrl={avatarUrl} isCollapsed={isCollapsed} />
                )}
                {!isCollapsed && (
                  <MoreVertical className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align={isCollapsed ? "center" : "end"}
              alignOffset={isCollapsed ? 0 : -8}
              className="w-56 p-1.5 rounded-xl shadow-md border-border"
              sideOffset={16}
            >
              <div className="flex flex-col gap-1">
                {isCollapsed && (
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <p className="font-semibold font-sans text-sm truncate">{orgName || displayName}</p>
                    <p className="text-xs font-sans text-muted-foreground truncate">{orgType || (userType === "ADMIN" ? adminSubtitle : "Adotante")}</p>
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm h-10 font-sans font-medium" 
                  onClick={() => setIsPopoverOpen(false)}
                  asChild
                >
                  <Link to="/home/perfil">
                    <Settings className="mr-3 h-4 w-4 text-muted-foreground" />
                    Editar perfil
                  </Link>
                </Button>
                <Separator className="my-1" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm h-10 font-sans font-medium text-red-600 hover:text-red-700 hover:bg-red-50" 
                  onClick={() => {
                    setIsPopoverOpen(false)
                    handleSignOut()
                  }}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </aside>
    </TooltipProvider>
  )
}
