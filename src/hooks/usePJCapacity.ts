import { useState, useEffect, useCallback } from "react"
import { useProfile } from "@/hooks/useProfile"
import { supabase } from "@/lib/supabase"

interface CapacityState {
  totalCapacity: number
  occupiedSlots: number
}

interface UsePJCapacityResult {
  data: CapacityState | undefined
  isLoading: boolean
  updateCapacity: (newCapacity: number) => Promise<void>
}

/**
 * Hook compartilhado para capacidade do abrigo.
 * Lê e atualiza `total_capacity` da tabela `profiles` para a conta PJ autenticada.
 * Usado tanto em PJHomeView quanto em PJConfiguracoesPage para garantir
 * fonte única de verdade.
 */
export function usePJCapacity(): UsePJCapacityResult {
  const { profile } = useProfile()
  const [data, setData] = useState<CapacityState | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return

    let cancelled = false
    setIsLoading(true)

    supabase
      .from("profiles")
      .select("total_capacity")
      .eq("id", profile.id)
      .single()
      .then(({ data: row, error }) => {
        if (cancelled) return
        if (!error && row) {
          setData({
            totalCapacity: (row.total_capacity as number) || 0,
            occupiedSlots: 0, // placeholder until pets table is wired
          })
        }
        setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [profile?.id])

  const updateCapacity = useCallback(
    async (newCapacity: number) => {
      if (!profile?.id) return
      const { error } = await supabase
        .from("profiles")
        .update({ total_capacity: newCapacity })
        .eq("id", profile.id)

      if (error) throw error
      setData((prev) =>
        prev ? { ...prev, totalCapacity: newCapacity } : undefined
      )
    },
    [profile?.id]
  )

  return { data, isLoading, updateCapacity }
}
