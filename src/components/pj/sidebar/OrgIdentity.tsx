import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export type OrgType = "ONG" | "Abrigo"

interface OrgIdentityProps {
  orgName: string
  orgType: OrgType
  logoUrl?: string
  isCollapsed?: boolean
}

/** Gera as iniciais a partir do nome fantasia (até 2 letras). */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/**
 * Bloco de identidade da ONG/Abrigo exibido no topo da sidebar PJ.
 * Exibe logo (se disponível) ou Avatar com iniciais, nome fantasia e tipo de conta.
 */
export function OrgIdentity({ orgName, orgType, logoUrl, isCollapsed }: OrgIdentityProps) {
  return (
    <div className={cn("flex items-center gap-3 py-4 w-full overflow-hidden", isCollapsed ? "justify-center px-0" : "px-4")}>
      <Avatar className="h-10 w-10 shrink-0 rounded-lg border border-[#3B0270]/12">
        {logoUrl && <AvatarImage src={logoUrl} alt={`Logo ${orgName}`} />}
        <AvatarFallback
          className="rounded-lg bg-[#3B0270]/8 text-[#3B0270] text-sm font-bold"
        >
          {getInitials(orgName)}
        </AvatarFallback>
      </Avatar>

      {!isCollapsed && (
        <div className="flex min-w-0 flex-col items-start text-left">
          <span
            className="truncate w-full text-sm font-bold leading-tight text-foreground"
            title={orgName}
          >
            {orgName}
          </span>
          <span className="truncate w-full text-xs text-muted-foreground font-medium leading-tight mt-0.5" title={orgType}>
            {orgType}
          </span>
        </div>
      )}
    </div>
  )
}
