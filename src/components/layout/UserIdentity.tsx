import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserIdentityProps {
  displayName: string
  avatarUrl?: string
  subtitle?: string
}

/** Gera as iniciais a partir do nome (até 2 letras). */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/**
 * Bloco de identidade do usuário PF exibido no topo da sidebar.
 * Exibe foto (se disponível) ou Avatar com iniciais, nome e subtítulo.
 */
export function UserIdentity({
  displayName,
  avatarUrl,
  subtitle = "Adotante",
}: UserIdentityProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-4">
      <Avatar className="h-10 w-10 shrink-0 rounded-lg border border-[#3B0270]/12">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={`Foto de ${displayName}`} />}
        <AvatarFallback className="rounded-lg bg-[#3B0270]/8 text-[#3B0270] text-sm font-bold">
          {getInitials(displayName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-col">
        <span
          className="truncate text-sm font-bold leading-tight text-foreground"
          title={displayName}
        >
          {displayName}
        </span>
        <span className="text-xs text-muted-foreground font-medium leading-tight mt-0.5">
          {subtitle}
        </span>
      </div>
    </div>
  )
}
