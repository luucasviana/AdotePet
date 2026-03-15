import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import type { UserType } from "@/hooks/useProfile"

export interface Profile {
  id: string
  email: string | null
  user_type: UserType
  // PJ fields (nullable for PF accounts)
  company_name?: string | null
  fantasy_name?: string | null
  org_type?: string | null
  logo_url?: string | null
  // PF fields
  full_name?: string | null
  social_name?: string | null
  avatar_url?: string | null
}

export interface ProfileContextValue {
  profile: Profile | null
  userType: UserType
  loading: boolean
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: null,
  userType: "PF",
  loading: true,
})

export function ProfileProvider({ children }: { children: ReactNode }) {
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
      .select("id, email, user_type, company_name, fantasy_name, org_type, logo_url, full_name, social_name, avatar_url")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error || !data) {
          // Fallback: derive type from user_metadata if profile doesn't exist yet
          const metaTipo = user.user_metadata?.tipo as string | undefined
          const fallbackType: UserType =
            metaTipo?.toLowerCase() === "pj" ? "PJ" : "PF"
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

  const userType = (profile?.user_type ?? "PF") as UserType

  return (
    <ProfileContext.Provider value={{ profile, userType, loading: authLoading || loading }}>
      {children}
    </ProfileContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProfileContext() {
  return useContext(ProfileContext)
}
