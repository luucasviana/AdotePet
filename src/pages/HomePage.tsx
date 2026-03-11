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
