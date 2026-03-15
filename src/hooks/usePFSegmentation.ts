import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/AuthContext"

interface UsePFSegmentationResult {
  isLinkedToPJ: boolean
  loading: boolean
}

/**
 * Verifica se o usuário PF autenticado possui vínculo ativo com alguma conta PJ.
 * Consulta a tabela team_members (pf_id = auth.uid(), status = 'active').
 *
 * - isLinkedToPJ = true  → PF vinculada a PJ: NÃO deve ver a Home PF pública
 * - isLinkedToPJ = false → PF comum: deve ver a Home PF pública
 */
export function usePFSegmentation(): UsePFSegmentationResult {
  const { user } = useAuth()
  const [isLinkedToPJ, setIsLinkedToPJ] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsLinkedToPJ(false)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    supabase
      .from("team_members")
      .select("id")
      .eq("pf_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setIsLinkedToPJ(!!data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  return { isLinkedToPJ, loading }
}
