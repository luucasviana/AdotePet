import { useProfileContext } from "@/context/ProfileContext"
export type { Profile } from "@/context/ProfileContext"

export type UserType = "PF" | "PJ" | "ADMIN"

interface UseProfileResult {
  profile: any | null
  userType: UserType
  loading: boolean
}

/**
 * Lê o perfil do usuário autenticado no cache global (ProfileContext).
 * Expõe `userType` (PF | PJ | ADMIN) para uso em Sidebar e Home.
 */
export function useProfile(): UseProfileResult {
  const context = useProfileContext()
  return context
}
