import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { useProfile } from "@/hooks/useProfile"
import { PJHomeView } from "@/components/home/PJHomeView"
import { PFHomeView } from "@/components/home/PFHomeView"
import { AdminHomeView } from "@/components/home/AdminHomeView"

/**
 * Página Home única para todos os usuários autenticados.
 *
 * Detecta o tipo do usuário via useProfile() e renderiza
 * condicionalmente a View correta:
 * - PJ    → PJHomeView
 * - ADMIN → AdminHomeView
 * - PF    → PFHomeView (padrão)
 */
export function HomePage() {
  const { userType, loading } = useProfile()
  const navigate = useNavigate()

  useEffect(() => {
    const pendingPetId = localStorage.getItem("pending_pet_redirect")
    if (pendingPetId) {
      localStorage.removeItem("pending_pet_redirect")
      // Adding a small delay to ensure loading state of auth/profile has settled
      // though typically not strictly needed, it avoids race conditions if profile takes a moment
      setTimeout(() => navigate(`/home/pets/${pendingPetId}`), 0)
    }
  }, [navigate])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-80 rounded-lg" />
        <div className="flex gap-4 mt-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (userType === "PJ")    return <PJHomeView />
  if (userType === "ADMIN") return <AdminHomeView />
  return <PFHomeView />
}
