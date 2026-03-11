import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"

export type UserType = "PF" | "PJ" | "ADMIN"

interface Profile {
  id: string
  email: string | null
  user_type: UserType
}

interface UseProfileResult {
  profile: Profile | null
  userType: UserType
  loading: boolean
}

/**
 * Lê o perfil do usuário autenticado em public.profiles.
 * Expõe `userType` (PF | PJ | ADMIN) para uso em Sidebar e Home.
 * Fallback para PF se o perfil ainda não foi carregado.
 */
export function useProfile(): UseProfileResult {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    supabase
      .from("profiles")
      .select("id, email, user_type")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          // Fallback: derivar do user_metadata se o perfil não existir ainda
          const metaTipo = user.user_metadata?.tipo as string | undefined
          const fallbackType: UserType =
            metaTipo?.toLowerCase() === "pj" ? "PJ" : "PF"
          setProfile(null)
          // Still expose the type via a synthesized profile
          setProfile({ id: user.id, email: user.email ?? null, user_type: fallbackType })
        } else {
          setProfile(data as Profile)
        }
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, authLoading])

  return {
    profile,
    userType: (profile?.user_type ?? "PF") as UserType,
    loading: authLoading || loading,
  }
}
