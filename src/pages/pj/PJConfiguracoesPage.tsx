import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthPageHeader } from "@/components/layout/AuthPageHeader"
import { CapacityCard } from "@/components/pj/CapacityCard"
import { TeamMembersSection, type TeamMember } from "@/components/pj/settings/TeamMembersSection"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export function PJConfiguracoesPage() {
  const { profile } = useProfile()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)

  // Real Data State
  const [orgData, setOrgData] = useState<Record<string, unknown> | null>(null)

  const mockCapacity = {
    totalCapacity: (orgData?.total_capacity as number) || 0,
    occupiedSlots: 0, // Mockado até tela de pets
  }

  // Avatar do proprietário: usa a foto do Supabase Auth (ex.: Google login).
  // Se não houver (cadastro manual), o TeamMembersSection exibe o fallback de iniciais.
  const ownerAvatarUrl: string | undefined =
    (user?.user_metadata?.avatar_url as string | undefined) || undefined

  const mockTeam: TeamMember[] = [
    {
      id: "1",
      name: profile?.full_name || profile?.company_name || "Você",
      email: profile?.email || "",
      role: "admin",
      status: "active",
      avatar: ownerAvatarUrl,
    },
  ]

  useEffect(() => {
    async function fetchOrg() {
      if (!profile?.id) return

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", profile.id)
          .single()

        if (!error && data && data.user_type === "PJ") {
          setOrgData(data as Record<string, unknown>)
        } else if (error) {
          console.error("Erro ao buscar perfil PJ:", error)
        }
      } catch (err) {
        console.error("Exceção ao buscar perfil PJ:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrg()
  }, [profile?.id])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-[#3B0270]" />
      </div>
    )
  }

  const handleUpdateCapacity = async (newCapacity: number) => {
    if (!orgData) return
    const { error } = await supabase
      .from("profiles")
      .update({ total_capacity: newCapacity })
      .eq("id", orgData.id as string)

    if (!error) {
      setOrgData({ ...orgData, total_capacity: newCapacity })
    } else {
      throw error
    }
  }

  const emptyState = (
    <div className="p-8 text-center bg-white rounded-2xl border border-border">
      <p className="text-muted-foreground font-sans">Organização não encontrada para esta conta.</p>
    </div>
  )

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50">
      <AuthPageHeader
        title="Configurações"
        subtitle="Gerencie as informações operacionais da sua organização."
      />

      <div className="flex flex-1 flex-col p-6 md:p-8 overflow-y-auto">
        <Tabs defaultValue="capacidade" className="flex flex-col flex-1 max-w-[1000px] w-full mx-auto">
          <TabsList className="w-fit rounded-lg h-10 mb-6 bg-muted">
            <TabsTrigger
              value="capacidade"
              className="rounded-lg text-sm font-semibold data-[state=active]:bg-[#3B0270] data-[state=active]:text-white"
            >
              Capacidade
            </TabsTrigger>
            <TabsTrigger
              value="equipe"
              className="rounded-lg text-sm font-semibold data-[state=active]:bg-[#3B0270] data-[state=active]:text-white"
            >
              Equipe
            </TabsTrigger>
          </TabsList>

          {/* Aba 1 — Capacidade */}
          <TabsContent
            value="capacidade"
            className="flex flex-col gap-6 focus-visible:outline-none focus-visible:ring-0"
          >
            {orgData ? (
              <CapacityCard
                data={mockCapacity}
                editable
                onCapacityUpdate={handleUpdateCapacity}
              />
            ) : (
              emptyState
            )}
          </TabsContent>

          {/* Aba 2 — Equipe */}
          <TabsContent
            value="equipe"
            className="flex flex-col gap-6 focus-visible:outline-none focus-visible:ring-0"
          >
            {orgData ? (
              <TeamMembersSection members={mockTeam} />
            ) : (
              emptyState
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
