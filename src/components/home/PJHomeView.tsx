import { AuthPageHeader } from "@/components/layout/AuthPageHeader"
import { HomeIndicators } from "@/components/pj/home/HomeIndicators"
import { CapacityCard } from "@/components/pj/CapacityCard"
import { HomeAdoptions } from "@/components/pj/home/HomeAdoptions"
import { RecentActivities, type PetActivity } from "@/components/pj/home/RecentActivities"
import { usePJCapacity } from "@/hooks/usePJCapacity"
import { fetchActiveAdoptionsForOwner, type AdoptionWithDetails } from "@/lib/actions/adoptions"
import { useState, useEffect } from "react"

// Mock data for V1 — indicators and activities not yet connected to Supabase
const mockIndicators = {
  totalPets: 124,
  available: 42,
  inProgress: 8,
  completed: 74,
}

const mockActivities: PetActivity[] = [
  { id: "1", petName: "Lily", action: "Cadastrado", date: "Hoje às 09:12" },
  { id: "2", petName: "Lily", action: "Movido para andamento", relatedPerson: "Maria Souza", date: "Hoje às 14:36" },
  { id: "3", petName: "Thor", action: "Adoção concluída", relatedPerson: "João Lima", date: "Ontem às 17:10" },
  { id: "4", petName: "Rex", action: "Interessado vinculado", relatedPerson: "Pedro Alves", date: "Ontem às 10:45" },
]

/**
 * View da Home para usuários do tipo PJ (ONG/Abrigo).
 * Renderizada condicionalmente dentro da HomePage quando userType === 'PJ'.
 */
export function PJHomeView() {
  const { data: capacityData, isLoading: capacityLoading, updateCapacity } = usePJCapacity()
  const [activeAdoptions, setActiveAdoptions] = useState<AdoptionWithDetails[]>([])
  const [adoptionsLoading, setAdoptionsLoading] = useState(true)

  useEffect(() => {
    fetchActiveAdoptionsForOwner().then(({ data }) => {
      setActiveAdoptions(data)
      setAdoptionsLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-1 flex-col h-full bg-slate-50/50">
      <AuthPageHeader
        title="Início"
        subtitle="Visão geral da sua organização"
        showDateFilter
      />

      {/* Área de conteúdo — Home PJ V1 */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex flex-col gap-8 max-w-[1600px] mx-auto">
          {/* Indicadores Principais */}
          <HomeIndicators data={mockIndicators} />

          {/* Capacidade — dados reais via usePJCapacity (mesma fonte que Configurações) */}
          <CapacityCard
            data={capacityData}
            isLoading={capacityLoading}
            editable
            onCapacityUpdate={updateCapacity}
          />

          {/* Adoções em Andamento */}
          <HomeAdoptions data={activeAdoptions} isLoading={adoptionsLoading} />

          {/* Atividades Recentes (largura total) */}
          <RecentActivities data={mockActivities} context="global" />
        </div>
      </div>
    </div>
  )
}
