import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { LogOut, Plus } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { NAV_CONFIG } from "@/lib/nav-config"
import { SidebarNavItem } from "@/components/pj/sidebar/SidebarNavItem"
import { OrgIdentity } from "@/components/pj/sidebar/OrgIdentity"
import { UserIdentity } from "@/components/layout/UserIdentity"
import type { OrgType } from "@/components/pj/sidebar/OrgIdentity"

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
    <aside
      aria-label="Navegação principal"
      className="hidden md:flex h-screen w-64 shrink-0 flex-col border-r border-border bg-white"
    >
      {/* ── 1. Topo: identidade do usuário ── */}
      <div className="shrink-0 border-b border-border">
        {userType === "PJ" ? (
          <OrgIdentity orgName={orgName} orgType={orgType} logoUrl={logoUrl} />
        ) : userType === "ADMIN" ? (
          <UserIdentity displayName={displayName} avatarUrl={avatarUrl} subtitle={adminSubtitle} />
        ) : (
          <UserIdentity displayName={displayName} avatarUrl={avatarUrl} />
        )}
      </div>

      {/* ── 2. Nav principal ── */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 px-3 py-4">
          {/* CTA "+ Cadastrar pet" exclusivo da PJ */}
          {userType === "PJ" && (
            <div className="mb-2">
              <Button
                className="w-full h-10 rounded-lg gap-2 bg-[#3B0270] text-white font-bold hover:bg-[#3B0270]/90 focus-visible:ring-2 focus-visible:ring-[#3B0270]/50 focus-visible:ring-offset-1 shadow-sm transition-all duration-150"
                aria-label="Cadastrar novo pet"
              >
                <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                Cadastrar pet
              </Button>
            </div>
          )}

          <nav aria-label="Menu principal">
            {navSection.main.map((item) => (
              <SidebarNavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                end={item.end}
              />
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* ── 3. Rodapé: configurações + sair ── */}
      <div className="shrink-0 border-t border-border">
        <div className="flex flex-col gap-1 px-3 py-4">
          {navSection.footer.map((item) => (
            <SidebarNavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
            />
          ))}

          <Separator className="my-1" />

          <button
            onClick={handleSignOut}
            aria-label="Sair da conta"
            className="flex items-center gap-3 rounded-lg px-3 h-10 min-h-10 w-full text-sm font-semibold text-muted-foreground transition-colors duration-150 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:ring-offset-1"
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
